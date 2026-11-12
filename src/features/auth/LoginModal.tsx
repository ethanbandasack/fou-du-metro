'use client';

import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

interface LoginModalProps {
  onLogin: (code: string) => Promise<string | null>;
  onClose: () => void;
}

export function LoginModal({ onLogin, onClose }: LoginModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    setPending(true);
    const failure = await onLogin(code);
    setPending(false);
    if (failure) setError(failure);
    else onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80]" onClick={onClose}>
      <div className="bg-card border border-border p-6 shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-foreground">Connexion</h3>
          <button onClick={onClose} className="text-foreground/50 hover:text-foreground" aria-label="Fermer">
            <X size={24} />
          </button>
        </div>
        <p className="text-foreground/60 mb-4 text-sm">
          Entrez votre code d&apos;authentification pour sauvegarder vos scores et suivre votre progression.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="authCode" className="block text-sm font-medium text-foreground/70 mb-1">
              Code d&apos;authentification
            </label>
            <input
              id="authCode"
              type="password"
              autoFocus
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(null); }}
              className="w-full px-3 py-2 border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono"
              placeholder="Entrez votre code..."
              required
            />
            {error ? (
              <p className="text-xs text-red-600 mt-1 font-bold" role="alert">{error}</p>
            ) : (
              <p className="text-xs text-foreground/40 mt-1">
                Contactez l&apos;administrateur pour obtenir votre code d&apos;authentification
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 bg-accent text-accent-foreground border border-border px-4 py-2 hover:opacity-80 transition-colors disabled:opacity-50"
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted text-foreground border border-border px-4 py-2 hover:opacity-80 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
