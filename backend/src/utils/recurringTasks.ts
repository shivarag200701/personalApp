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
            next.setDate(next.getDate() + interval);
            break;
        case "weekly":
            next.setDate(next.getDate() + interval * 7);
            break;
        case "monthly":
            next.setMonth(next.getMonth() + interval);
            break;
        case "yearly":
            next.setFullYear(next.getFullYear() + interval);
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
    console.log("recurring task template",template);

    if(!template){
        throw new Error("Recurring task template not found");
    }

    if(template.recurrenceEndDate && template.recurrenceEndDate < new Date()){
        return null;
    }

    const lastOccurence = template.nextOccurrence || template.completeAt || template.createdAt;
    const nextOccurrence = calculateNextOccurence(
        template.recurrencePattern as RecurrencePattern,
        template.recurrenceInterval || 1,
        lastOccurence
    );

    const completeAtDate = new Date(nextOccurrence);
    completeAtDate.setHours(23, 59, 59, 999);

    const newTask = await prisma.todo.create({
        data: {
            title: template.title,
            description: template.description,
            priority: template.priority,
            completeAt: completeAtDate,
            category: template.category,
            userId: template.userId,
            isRecurring: true,
            recurrencePattern: template.recurrencePattern,
            recurrenceInterval: template.recurrenceInterval,
            recurrenceEndDate: template.recurrenceEndDate,
            parentRecurringId: template.parentRecurringId || template.id,
            nextOccurrence: nextOccurrence,
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
    console.log("now",now);
    const templatesToProcess = await prisma.todo.findMany({
        where:{
            isRecurring: true,
            parentRecurringId: null,
            OR: [
                {completeAt: {lte: now}},
                {nextOccurrence: null}
            ]
        }
    })
    console.log("templates to process",templatesToProcess);
    for (const template of templatesToProcess) {
        try{await createRecurringTask(template.id, template.userId);
        }catch(error){
            console.error(`Error creating recurring task: ${error}`);
        }
    }
}