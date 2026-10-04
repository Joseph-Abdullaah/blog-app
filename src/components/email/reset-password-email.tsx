import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Tailwind,
  Preview,
} from "@react-email/components";

type ResetPasswordEmailProps = {
  resetUrl: string;
};

export default function ResetPasswordEmail({
  resetUrl,
}: ResetPasswordEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Reset your password</Preview>

      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "#18181b",
              },
            },
          },
        }}
      >
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-10 max-w-116.25 rounded-xl bg-white p-8">
            <Heading className="text-2xl font-bold text-gray-900">
              Reset your password
            </Heading>

            <Text className="text-sm leading-6 text-gray-600">
              Hello, you recently requested to reset your password for your Byline account.
            </Text>

            <Text className="text-sm leading-6 text-gray-600">
              We received a request to reset your password.
              Click the button below to choose a new one.
            </Text>

            <Button
              href={resetUrl}
              className="rounded-md bg-brand px-5 py-3 text-sm font-semibold text-white no-underline"
            >
              Reset password
            </Button>

            <Text className="text-xs leading-5 text-gray-500">
              If you did not request a password reset, you can
              safely ignore this email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}