"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as yup from "yup";

import {
  CheckboxField,
  CustomButton,
  FloatingLabelInput,
} from "@/components/ui";
import { useSendEmailOtpMutation } from "@/store/api/authApi";
import { getErrorMessage } from "@/utilities/helpers";

const emailOtpSchema = yup.object({
  email: yup
    .string()
    .required("Please enter your email.")
    .email("Enter a valid email address."),
  keepSigned: yup.boolean().default(true),
});

type EmailOtpFormValues = yup.InferType<typeof emailOtpSchema>;

export default function EmailOTPPage() {
  const router = useRouter();
  const [sendEmailOtp, { isLoading }] = useSendEmailOtpMutation();

  const methods = useForm<EmailOtpFormValues>({
    resolver: yupResolver(emailOtpSchema),
    defaultValues: {
      email: "",
      keepSigned: true,
    },
  });

  const { control, handleSubmit, clearErrors, setError } = methods;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await sendEmailOtp({
        email: values.email,
        channel: "email",
      }).unwrap();
      localStorage.setItem("otp_email", values.email);
      router.push("/login/confirm-otp");
    } catch (err) {
      setError("email", {
        message: getErrorMessage(err, {
          fallbackMessage: "Failed to send OTP.",
        }),
      });
    }
  });

  return (
    <div className="min-h-screen">
      <div className="flex h-screen items-center justify-center px-5">
        <div className="w-full max-w-[380px] rounded-2xl px-[30px] text-center">
          {/* TODO: Add logo */}
          <h2 className="mb-6 text-2xl font-bold tracking-wide text-[#b8972a]">
            YORIS
          </h2>
          <p className="mb-5 text-[15px] text-white">
            Enter email to receive OTP
          </p>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="text-left">
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <FloatingLabelInput
                    {...field}
                    id="email-otp-email"
                    label="Email"
                    type="email"
                    placeholder=""
                    error={fieldState.error?.message}
                    onChange={(e) => {
                      clearErrors("email");
                      field.onChange(e);
                    }}
                    wrapperClassName="mb-3"
                  />
                )}
              />
              <Controller
                name="keepSigned"
                control={control}
                render={({ field }) => (
                  <CheckboxField
                    className="mt-2"
                    label="Keep me signed in"
                    checked={field.value ?? true}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <CustomButton
                className="mt-5"
                type="submit"
                loading={isLoading}
                loadingContent="SENDING OTP…"
              >
                CONTINUE
              </CustomButton>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
