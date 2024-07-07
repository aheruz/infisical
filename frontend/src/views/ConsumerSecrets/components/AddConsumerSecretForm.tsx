import { Controller } from "react-hook-form";
import { Input } from "@app/components/v2";
import { AxiosError } from "axios";
import { createNotification } from "@app/components/notifications";
import { useCreateConsumerSecret } from "@app/hooks/api/consumerSecrets";
import { encryptData } from "../ConsumerSecretsPage.utils";

export const AddConsumerSecretForm = ({
    control,
    handleSubmit,
    isSubmitting,
    isInputDisabled,
    onSubmit,
    fields
}: {
    control: any;
    handleSubmit: any;
    isSubmitting: boolean;
    isInputDisabled?: boolean;
    onSubmit: () => void;
    fields: { name: string; label: string; type: string }[];
}) => {
    const createConsumerSecret = useCreateConsumerSecret();
    
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
            await createConsumerSecret.mutateAsync(encryptedData);
            createNotification({
                text: "Successfully created a consumer secret",
                type: "success"
            });
            onSubmit();
        } catch (err) {
            console.error('Error creating consumer secret:', err);
            const axiosError = err as AxiosError;
            if (axiosError?.response?.status === 401) {
                createNotification({
                    text: "You do not have access to create consumer secrets",
                    type: "error"
                });
            } else {
                createNotification({
                    text: "Failed to create a consumer secret",
                    type: "error"
                });
            }
        }
    };
    
    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
        {fields.map((field) => (
            <div key={field.name}>
                <label>{field.label}</label>
                <Controller
                    control={control}
                    name={field.name}
                    defaultValue="" // Ensure default value is provided
                    render={({ field: controllerField }) => (
                        <Input {...controllerField} type={field.type} disabled={isInputDisabled} />
                    )}
                />
            </div>
        ))}
        <button type="submit" disabled={isSubmitting}>Save</button>
        </form>
    );
};