import prisma from "../lib/prisma.js";

export const getMessage = async (req, res) => {
  const tokenUserId = req.user.userId;
  const { chatId, messageId } = req.params;

  try {
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userIDs: { hasSome: [tokenUserId] } },
      select: { id: true },
    });
    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    const message = await prisma.message.findFirst({ where: { id: messageId, chatId } });
    if (!message) return res.status(404).json({ message: "Message not found!" });

    return res.status(200).json(message);
  } catch (err) {
    console.error("Error in getMessage:", err.message);
    return res.status(500).json({ message: "Failed to get message! " + err.message });
  }
};

export const addMessage = async (req, res) => {
  const tokenUserId = req.user.userId;
  const chatId = req.params.chatId;
  const text = req.body.text;

  try {
    // 1. Check if chat exists and user belongs to it
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userIDs: {
          hasSome: [tokenUserId],
        },
      },
    });

    if (!chat) return res.status(404).json({ message: "Chat not found!" });

    // 2. Create the message record
    const message = await prisma.message.create({
      data: {
        text,
        chatId,
        userId: tokenUserId,
      },
    });

    // 3. Update reference on parent chat object
    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: [tokenUserId], 
        lastMessage: text,
      },
    });

    res.status(200).json(message);
  } catch (err) {
    console.error("Error in addMessage:", err.message);
    res.status(500).json({ message: "Failed to add message! " + err.message });
  }
};
