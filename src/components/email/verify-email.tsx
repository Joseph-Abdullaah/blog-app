import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type VerifyEmailProps = {
  verificationUrl: string;
};

export default function VerifyEmail({
  verificationUrl,
}: VerifyEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Verify your email address to get started.</Preview>

      <Tailwind>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="mx-auto max-w-140 rounded-xl bg-white p-8">
            <Section className="text-center">
              <Text className="text-2xl font-bold text-gray-900">
                MyBlog
              </Text>

              <Heading className="mt-8 text-2xl font-bold text-gray-900">
                Verify your email address
              </Heading>

              <Text className="text-base leading-7 text-gray-600">
                Hello, you recently signed up for a MyBlog account. Please verify your email address to get started and help keep your account secure.
              </Text>

              <Text className="text-base leading-7 text-gray-600">
                Thanks for joining MyBlog! Please verify your
                email address to get started and help keep
                your account secure.
              </Text>

              <Button
                href={verificationUrl}
                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white no-underline"
              >
                Verify Email Address
              </Button>

              <Text className="mt-6 text-sm text-gray-500">
                If the button does not work, copy and paste
                this link into your browser:
              </Text>

              <Text className="break-all text-sm text-blue-600">
                {verificationUrl}
              </Text>
            </Section>

            <Section className="mt-8 border-t border-gray-200 pt-5">
              <Text className="text-center text-sm leading-6 text-gray-500">
                If you did not create a MyBlog account, you
                can safely ignore this email.
              </Text>

              <Text className="mt-6 text-center text-sm text-gray-500">
                Happy blogging!
              </Text>

              <Text className="text-center text-xs text-gray-400">
                © MyBlog
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
