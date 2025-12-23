import type { Todo } from "@prisma/client";
import prisma from "../db/index.js";

export type RecurrencePattern = "daily" | "weekly" | "monthly" | "yearly";

export const calculateNextOccurence = (
    pattern: RecurrencePattern,
    interval: number,
    lastOccurence: Date
): Date => {
    const next = new Date(lastOccurence);
    switch (pattern){
        case "daily":
            next.setUTCDate(next.getUTCDate() + interval);
            break;
        case "weekly":
            next.setUTCDate(next.getUTCDate() + interval * 7);
            break;
        case "monthly":
            next.setUTCMonth(next.getUTCMonth() + interval);
            break;
        case "yearly":
            next.setUTCFullYear(next.getUTCFullYear() + interval);
            break;
        default:
            throw new Error(`Invalid recurrence pattern: ${pattern}`);
    }
    return next;
}

export async function createRecurringTask(
    templateId: number,
    userId: number
): Promise<Todo | null> {
    const template = await prisma.todo.findUnique({
        where: {
            id: templateId,
            userId,
            isRecurring: true,
        }
    })

    if(!template){
        throw new Error("Recurring task template not found");
    }

    if(template.recurrenceEndDate && template.recurrenceEndDate < new Date()){
        return null;
    }

    const lastOccurence = template.nextOccurrence || (template.dueOn ? (template.dueOn <= new Date() ? template.dueOn : template.createdAt) :
    (template.dueAt ? (template.dueAt <= new Date() ? template.dueAt : template.createdAt) :
    template.createdAt));
    const nextOccurrence = calculateNextOccurence(
        template.recurrencePattern as RecurrencePattern,
        template.recurrenceInterval || 1,
        lastOccurence
    );

    const completeAtDate = new Date(nextOccurrence);
    // Use noon UTC to avoid timezone rollover issues
    completeAtDate.setUTCHours(12, 0, 0, 0);

    const newTask = await prisma.todo.create({
        data: {
            title: template.title,
            description: template.description,
            priority: template.priority,
            dueOn: template.dueOn ? completeAtDate : null,
            dueAt: template.dueAt ? completeAtDate : null,
            category: template.category,
            userId: template.userId,
            isRecurring: true,
            recurrencePattern: template.recurrencePattern,
            recurrenceInterval: template.recurrenceInterval,
            recurrenceEndDate: template.recurrenceEndDate,
            parentRecurringId: template.parentRecurringId || template.id,
            nextOccurrence: null,
        }
    });

    await prisma.todo.update({
        where: {
            id: templateId,
        },
        data: {
            nextOccurrence: nextOccurrence,
        }
    });

    return newTask;
}

export async function processRecurringTasks(): Promise<void> {
    const now = new Date();
    const templatesToProcess = await prisma.todo.findMany({
        where:{
            isRecurring: true,
            parentRecurringId: null,
            OR: [
                {nextOccurrence: {lte: now}},
                {nextOccurrence: null}
            ]
        }
    })
    for (const template of templatesToProcess) {
        try{await createRecurringTask(template.id, template.userId);
        }catch(error){
            console.error(`Error creating recurring task: ${error}`);
        }
    }
}