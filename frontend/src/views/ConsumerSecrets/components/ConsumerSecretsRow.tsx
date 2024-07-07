import { useEffect, useState } from "react";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { IconButton, Td, Tr } from "@app/components/v2";
import { TDecryptedConsumerSecret } from "@app/hooks/api/consumerSecrets/types";
import { UsePopUpState } from "@app/hooks/usePopUp";

const formatDate = (date: Date): string => (date ? new Date(date).toUTCString() : "");

const isExpired = (expiresAt: Date | number | undefined): boolean => {
  if (typeof expiresAt === "number") {
    return expiresAt <= 0;
  }
  if (expiresAt instanceof Date) {
    return new Date(expiresAt) < new Date();
  }
  return false;
};

const getValidityStatusText = (expiresAt: Date): string =>
  isExpired(expiresAt) ? "Expired " : "Valid for ";

const timeAgo = (inputDate: Date, currentDate: Date): string => {
  const now = new Date(currentDate).getTime();
  const date = new Date(inputDate).getTime();
  const elapsedMilliseconds = now - date;
  const elapsedSeconds = Math.abs(Math.floor(elapsedMilliseconds / 1000));
  const elapsedMinutes = Math.abs(Math.floor(elapsedSeconds / 60));
  const elapsedHours = Math.abs(Math.floor(elapsedMinutes / 60));
  const elapsedDays = Math.abs(Math.floor(elapsedHours / 24));
  const elapsedWeeks = Math.abs(Math.floor(elapsedDays / 7));
  const elapsedMonths = Math.abs(Math.floor(elapsedDays / 30));
  const elapsedYears = Math.abs(Math.floor(elapsedDays / 365));

  if (elapsedYears > 0) {
    return `${elapsedYears} year${elapsedYears === 1 ? "" : "s"} ${
      elapsedMilliseconds >= 0 ? "ago" : "from now"
    }`;
  }
  if (elapsedMonths > 0) {
    return `${elapsedMonths} month${elapsedMonths === 1 ? "" : "s"} ${
      elapsedMilliseconds >= 0 ? "ago" : "from now"
    }`;
  }
  if (elapsedWeeks > 0) {
    return `${elapsedWeeks} week${elapsedWeeks === 1 ? "" : "s"} ${
      elapsedMilliseconds >= 0 ? "ago" : "from now"
    }`;
  }
  if (elapsedDays > 0) {
    return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ${
      elapsedMilliseconds >= 0 ? "ago" : "from now"
    }`;
  }
  if (elapsedHours > 0) {
    return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ${
      elapsedMilliseconds >= 0 ? "ago" : "from now"
    }`;
  }
  if (elapsedMinutes > 0) {
    return `${elapsedMinutes} minute${elapsedMinutes === 1 ? "" : "s"} ${
      elapsedMilliseconds >= 0 ? "ago" : "from now"
    }`;
  }
  return `${elapsedSeconds} second${elapsedSeconds === 1 ? "" : "s"} ${
    elapsedMilliseconds >= 0 ? "ago" : "from now"
  }`;
};

export const ConsumerSecretsRow = ({
  row,
  handlePopUpOpen
}: {
  row: TDecryptedConsumerSecret;
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<["deleteSharedSecretConfirmation"]>,
    {
      name,
      id
    }: {
      name: string;
      id: string;
    }
  ) => void;
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <Tr key={row.id}>
      <Td>{row.title}</Td>
      <Td>{row.type}</Td>
      <Td>{row.comment}</Td>
      <Td>{row.data}</Td>
      <Td>
        <IconButton
          onClick={() =>
            handlePopUpOpen("deleteSharedSecretConfirmation", {
              name: "delete",
              id: row.id
            })
          }
          colorSchema="danger"
          ariaLabel="delete"
        >
          <FontAwesomeIcon icon={faTrashCan} />
        </IconButton>
      </Td>
    </Tr>
  );
};