import { faKey } from "@fortawesome/free-solid-svg-icons";

import {
  EmptyState,
  Table,
  TableContainer,
  TableSkeleton,
  TBody,
  Td,
  Th,
  THead,
  Tr
} from "@app/components/v2";
import { useGetConsumerSecrets } from "@app/hooks/api/consumerSecrets";
import { UsePopUpState } from "@app/hooks/usePopUp";

import { ConsumerSecretsRow } from "./ConsumerSecretsRow";

type Props = {
  handlePopUpOpen: (
    popUpName: keyof UsePopUpState<["deleteConsumerSecretConfirmation"]>,
    {
      name,
      id
    }: {
      name: string;
      id: string;
    }
  ) => void;
};

export const ConsumerSecretsTable = ({ handlePopUpOpen }: Props) => {
  const { isLoading, data = [] } = useGetConsumerSecrets();
  let tableData = data

  return (
    <TableContainer>
      <Table>
        <THead>
          <Tr>
            <Th>Secret Name</Th>
            <Th>Type</Th>
            <Th>Comment</Th>
            <Th aria-label="button" />
          </Tr>
        </THead>
        <TBody>
          {isLoading && <TableSkeleton columns={4} innerKey="consumer-secrets" />}
          {!isLoading &&
            tableData &&
            tableData.map((row) => (
              <ConsumerSecretsRow
                key={row.id}
                row={row}
                handlePopUpOpen={handlePopUpOpen}
              />
            ))}
          {!isLoading && tableData && tableData?.length === 0 && (
            <Tr>
              <Td colSpan={4} className="bg-mineshaft-800 text-center text-bunker-400">
                <EmptyState title="No secrets shared yet" icon={faKey} />
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>
    </TableContainer>
  );
};
