import Link from "next/link";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ConsumerSecretsSection } from "./components";

export const ConsumerSecretsPage = () => {
  return (
    <div className="container mx-auto h-full w-full max-w-7xl bg-bunker-800 px-6 text-white">
      <div className="flex items-center justify-between py-6">
        <div className="flex w-full flex-col">
          <h2 className="text-3xl font-semibold text-gray-2000">Consumer Secrets</h2>
          <p className="text-bunker-300">Manage your organizational secrets</p>
        </div>
      </div>
      <ConsumerSecretsSection />
    </div>
  );
};
