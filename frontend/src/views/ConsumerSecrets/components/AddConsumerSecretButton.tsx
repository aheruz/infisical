import React from 'react';
import { Button } from '@app/components/v2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUserLock, faCreditCard, faNoteSticky } from "@fortawesome/free-solid-svg-icons";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@app/components/v2";
import { UsePopUpState } from '@app/hooks/usePopUp';
import { ConsumerSecretType } from './types';

const consumerSecretTypes = [
    [
      <FontAwesomeIcon key={1} className="pr-4 text-sm" icon={faUserLock} />,
      "Web Login",
      "weblogin" as ConsumerSecretType
    ],
    [
      <FontAwesomeIcon key={2} className="pr-4 text-sm" icon={faCreditCard} />,
      "Credit Card",
      "creditcard" as ConsumerSecretType
    ],
    [
      <FontAwesomeIcon key={3} className="pr-4 text-sm" icon={faNoteSticky} />,
      "Secure Note",
      "securenote" as ConsumerSecretType
    ],
];

type Props = {
    handlePopUpOpen: (type: keyof UsePopUpState<ConsumerSecretType[]>) => void;
};

const AddConsumerSecretButton = ({ handlePopUpOpen }: Props) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    colorSchema="primary"
                    leftIcon={<FontAwesomeIcon icon={faPlus} />}
                >
                    Add Secret
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="p-1">
                {consumerSecretTypes.map(([icon, label, action]) => (
                    <DropdownMenuItem key={label} onClick={() => handlePopUpOpen(action)}>
                        {icon}
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AddConsumerSecretButton;
