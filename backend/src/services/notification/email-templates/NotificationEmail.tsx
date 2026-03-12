import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Row,
  Link,
  Column,
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

  const localDate = new Date(scheduledFor)
  

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
        <Container className="max-w-md">
            <Row className="table-cell h-[44px] w-[56px] align-bottom">
              <Column>
                      <Img
                        alt="FlowTask"
                        width={50}
                        height={50}
                        src="https://flowtask-static.s3.us-east-2.amazonaws.com/flowtask-logo.png"
                        className="my-0"
                      />
                      
              </Column>
              <Column>
                      <Text className="text-lg font-semibold m-0">
                        FlowTask
                      </Text>
              </Column>
            </Row>
        <Container className="bg-white border border-gray-200 rounded-xl p-6 max-w-md ">
            <Text className="text-slate-400 uppercase font-medium tracking-wide text-xs">
            🔔 Reminder
            </Text>
            <Heading className="text-2xl font-bold mb-2">
              {title}
            </Heading>
            <Text className="mt-0 mb-6 text-[#284ea7]">
              Due Now
            </Text>
            <Hr className="my-[16px] border-gray-200 border-t" />
            <Button className="rounded-lg p-3 bg-[#284ea7] text-white text-sm cursor-pointer"
            href={`http://localhost:5173/dashboard?task=${todoId}`}>
              Mark as Complete
            </Button>
        </Container>  
        </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default NotificationEmail;
