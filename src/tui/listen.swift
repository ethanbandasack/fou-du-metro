// Live dictation for the terminal quiz (macOS), compiled and started by voice.ts.
// Reads hint phrases on stdin (station names, one per line, until EOF), then prints:
//   ready              the microphone is on
//   heard<TAB>text     the transcript so far; it grows until the recognizer starts a new one
//   error<TAB>message  then exits
// Usage: listen [locale=fr-FR]
import AVFoundation
import Foundation
import Speech

setvbuf(stdout, nil, _IOLBF, 0)

func emit(_ kind: String, _ text: String? = nil) {
  print(text.map { "\(kind)\t\($0.replacingOccurrences(of: "\n", with: " "))" } ?? kind)
}

func fail(_ message: String) -> Never {
  emit("error", message)
  exit(1)
}

let hints = Array(AnyIterator { readLine() }.filter { !$0.isEmpty })
let locale = Locale(identifier: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "fr-FR")
guard let recognizer = SFSpeechRecognizer(locale: locale) else {
  fail("reconnaissance vocale indisponible en \(locale.identifier)")
}
let engine = AVAudioEngine()
var request: SFSpeechAudioBufferRecognitionRequest?
var quickFailures = 0

/// One recognition at a time; each ends after a pause or a time limit, then the next one starts.
@Sendable func listen() {
  let next = SFSpeechAudioBufferRecognitionRequest()
  next.shouldReportPartialResults = true
  next.contextualStrings = hints
  next.requiresOnDeviceRecognition = recognizer.supportsOnDeviceRecognition
  request = next
  let started = Date()
  var ended = false
  recognizer.recognitionTask(with: next) { result, error in
    if let result { emit("heard", result.bestTranscription.formattedString) }
    guard !ended, error != nil || result?.isFinal == true else { return }
    ended = true
    // A recognition that fails at once, again and again, will not recover.
    quickFailures = result == nil && Date().timeIntervalSince(started) < 1 ? quickFailures + 1 : 0
    if quickFailures > 5 { fail("reconnaissance vocale interrompue : \(error?.localizedDescription ?? "?")") }
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { listen() }
  }
}

func start() {
  let input = engine.inputNode
  let format = input.outputFormat(forBus: 0)
  guard format.channelCount > 0 else { fail("aucun micro") }
  input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in request?.append(buffer) }
  engine.prepare()
  do { try engine.start() } catch { fail("micro : \(error.localizedDescription)") }
  listen()
  emit("ready")
}

SFSpeechRecognizer.requestAuthorization { status in
  guard status == .authorized else {
    fail("reconnaissance vocale refusée (Réglages Système > Confidentialité et sécurité > Reconnaissance vocale)")
  }
  AVCaptureDevice.requestAccess(for: .audio) { granted in
    guard granted else { fail("micro refusé (Réglages Système > Confidentialité et sécurité > Micro)") }
    DispatchQueue.main.async { start() }
  }
}
dispatchMain()
