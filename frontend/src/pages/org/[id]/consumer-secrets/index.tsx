import { useTranslation } from "react-i18next";
import Head from "next/head";

import { ConsumerSecretsPage } from "@app/views/ConsumerSecrets";

const  ConsumerSecrets = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("common.head-title", { title: t("consumer-secrets.title") })}</title>
        <link rel="icon" href="/infisical.ico" />
        <meta property="og:image" content="/images/message.png" />
        <meta property="og:title" content={String(t("consumer-secrets.og-title"))} />
        <meta name="og:description" content={String(t("consumer-secrets.og-description"))} />
      </Head>
      <div className="h-full">
        <ConsumerSecretsPage />
      </div>
    </>
  );
};

export default ConsumerSecrets;

ConsumerSecrets.requireAuth = true;
