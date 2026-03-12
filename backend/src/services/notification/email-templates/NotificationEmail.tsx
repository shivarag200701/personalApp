import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";

interface NotificationProps {
  title: string;
  message: string;
  badgeLabel?: string;
  dueLabel?: string;
  appBaseUrl?: string;
  todoId?: string;
  scheduledFor: string
}

export function NotificationEmail({
  title,
  message,
  badgeLabel = "REMINDER",
  dueLabel = "Due now",
  appBaseUrl = "#",
  todoId,
  scheduledFor
}: NotificationProps) {
  const markCompleteUrl = todoId ? `${appBaseUrl}/todos/${todoId}/complete` : appBaseUrl;
  const snoozeUrl = todoId ? `${appBaseUrl}/todos/${todoId}/snooze` : appBaseUrl;
  const manageUrl = appBaseUrl === "#" ? "#" : `${appBaseUrl}/settings/reminders`;

  console.log(scheduledFor);
  

  return (
    <Html>
      <Head />
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                brand: "#007291",
              },
            },
          },
        }}
      >
        <Body className="bg-[#f5f5f5] font-sans">
          <Container className="mx-auto my-0 max-w-[420px] px-4 py-8">
            <Container
              className="bg-white px-6 py-6"
              style={{
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
              }}
            >
              {/* Header: bell + REMINDER */}
              <Text className="text-xs font-medium text-gray-400 uppercase tracking-wide m-0">
                🔔 {badgeLabel}
              </Text>
              <Heading as="h1" className="text-xl font-bold text-black mt-2 mb-1">
                {title}
              </Heading>
              <Text
                className="text-sm font-medium m-0"
                style={{ color: "#dc2626" }}
              >
                {dueLabel}
              </Text>

              {message ? (
                <>
                  <Text className="text-sm text-gray-600 mt-3 mb-0">
                    {message}
                  </Text>
                </>
              ) : null}

              <Hr className="border-gray-200 my-5" style={{ borderColor: "#e5e7eb" }} />

              {/* Action buttons */}
              <Container className="p-0">
                <Button
                  href={markCompleteUrl}
                  className="inline-block rounded-lg px-4 py-2.5 text-sm font-semibold text-white no-underline"
                  style={{
                    backgroundColor: "#dc2626",
                  }}
                >
                  Mark complete
                </Button>
              </Container>
            </Container>

            {/* Footer links */}
            <Text className="text-center text-sm mt-6 m-0">
              <Link
                href={manageUrl}
                className="no-underline font-medium"
                style={{ color: "#dc2626" }}
              >
                Manage reminders
              </Link>
              <span className="text-gray-400 mx-2">·</span>
              <Link
                href={`${appBaseUrl}/unsubscribe`}
                className="no-underline text-gray-500"
              >
                Unsubscribe
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default NotificationEmail;
