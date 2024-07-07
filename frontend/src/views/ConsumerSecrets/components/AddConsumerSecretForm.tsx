import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Input } from "@app/components/v2";
import { AxiosError } from "axios";
import { createNotification } from "@app/components/notifications";
import { useCreateConsumerSecret, useUpdateConsumerSecret } from "@app/hooks/api/consumerSecrets";
import { encryptData } from "../ConsumerSecretsPage.utils";
import { TDecryptedConsumerSecret } from "@app/hooks/api/consumerSecrets/types";
import { CopyButton } from "@app/views/Settings/ProjectSettingsPage/components/ProjectNameChangeSection/CopyButton";

export const AddConsumerSecretForm = ({
    control,
    handleSubmit,
    isSubmitting,
    isInputDisabled,
    onSubmit,
    fields,
    isEditMode = false,
    initialData
}: {
    control: any;
    handleSubmit: any;
    isSubmitting: boolean;
    isInputDisabled?: boolean;
    onSubmit: () => void;
    fields: { name: string; label: string; type: string }[];
    isEditMode?: boolean;
    initialData?: TDecryptedConsumerSecret;
}) => {
    const { reset } = useForm();
    const createConsumerSecret = useCreateConsumerSecret();
    const updateConsumerSecret = useUpdateConsumerSecret();

    useEffect(() => {
        if (isEditMode && initialData) {
            reset(initialData);
        }
    }, [isEditMode, initialData, reset]);

    const onFormSubmit = async (data: any) => {
        try {
            const { title, type, comment, ...rest } = data;
            const transformedData = {
                title,
                type,
                comment,
                data: JSON.stringify(rest)
            };
            const encryptedData = encryptData(transformedData);

            if (isEditMode) {
                await updateConsumerSecret.mutateAsync({ ...encryptedData, id: initialData.id });
                createNotification({
                    text: "Successfully updated the consumer secret",
                    type: "success"
                });
            } else {
                await createConsumerSecret.mutateAsync(encryptedData);
                createNotification({
                    text: "Successfully created a consumer secret",
                    type: "success"
                });
            }
            onSubmit();
        } catch (err) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} consumer secret:`, err);
            const axiosError = err as AxiosError;
            if (axiosError?.response?.status === 401) {
                createNotification({
                    text: `You do not have access to ${isEditMode ? 'update' : 'create'} consumer secrets`,
                    type: "error"
                });
            } else {
                createNotification({
                    text: `Failed to ${isEditMode ? 'update' : 'create'} a consumer secret`,
                    type: "error"
                });
            }
        }
    };

    if (initialData) {
        // bring data from initialData to the form
        // extract data from initialData and put it in the root of initialData
        const data = JSON.parse(initialData.data);
        initialData = { ...initialData, ...data };
    }
    
    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
        {fields.map((field) => (
            <div key={field.name}>
                <label>{field.label}</label>
                <div className="flex items-center justify-between mb-3">
                <Controller
                    control={control}
                    name={field.name}
                    defaultValue={initialData?.[field.name] || ""}
                    render={({ field: controllerField }) => (
                        <Input {...controllerField} type={field.type} disabled={isInputDisabled} />
                    )}
                />
                {isEditMode && (
                    <div className="ml-2">
                        <CopyButton
                            value={initialData?.[field.name] || ""}
                            hoverText="Copy"
                            notificationText={`${field.label} copied to clipboard`}
                        >
                            Copy
                        </CopyButton>
                    </div>
                    )}
                </div>
            </div>
        ))}
            <div className="flex items-center justify-left pt-2">
                <Button className="mr-4" type="submit" isDisabled={isSubmitting} isLoading={isSubmitting}>
                    {isEditMode ? "Save" : "Create"}
                </Button>
            </div>
        </form>
    );
};