import type { Todo } from "../Components/Modal";

export default function sortTasksByDateAndOrder(tasks: Todo[]): Todo[] {
    return [...tasks].sort((a, b) => {
      // Both untimed - sort by order field
      if (a.isAllDay && b.isAllDay) {
        const aOrder = a.order ?? 0;
        const bOrder = b.order ?? 0;
        return aOrder - bOrder;
      }
      
      // Untimed goes to end
      if (a.isAllDay) return 1;
      if (b.isAllDay) return -1;
      
      // Both timed - sort by completeAt time
      if (a.completeAt && b.completeAt) {
        return new Date(a.completeAt).getTime() - new Date(b.completeAt).getTime();
      }
      
      // Handle missing completeAt
      if (!a.completeAt) return 1;
      if (!b.completeAt) return -1;
      
      return 0;
    });
  }