import HomePage from "@/components/HomePage";
import { loadNetwork } from "@/server/loadNetwork";

export default function Page() {
  return <HomePage network={loadNetwork()} />;
}
