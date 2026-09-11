import { db } from "~/server/db";
import { auth } from "~/server/auth";
import { getPresignedUrl } from "./s3";
import { ServiceType } from "~/types/services";

export interface HistoryItem {
  id: string;
  title: string;
  voice: string;
  audioUrl: string | null;
  service: ServiceType;
  date: string;
  time: string;
  createdAt: Date;
}

export async function getHistoryItems(service: ServiceType): Promise<HistoryItem[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  try {
    const clips = await db.generatedAudioClip.findMany({
      where: {
        userId: session.user.id,
        service: service,
        failed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const historyItems = await Promise.all(
      clips.map(async (clip) => {
        let audioUrl: string | null = null;
        if (clip.s3Key) {
          try {
            audioUrl = await getPresignedUrl({ key: clip.s3Key });
          } catch {
            audioUrl = null;
          }
        }

        const dateObj = new Date(clip.createdAt);
        const date = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const time = dateObj.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        return {
          id: clip.id,
          title: clip.text ?? "Generated Audio",
          voice: clip.voice ?? "default",
          audioUrl,
          service: clip.service as ServiceType,
          date,
          time,
          createdAt: clip.createdAt,
        };
      }),
    );

    return historyItems;
  } catch (error) {
    console.error("Error fetching history items:", error);
    return [];
  }
}
