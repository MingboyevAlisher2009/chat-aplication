export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessages: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
  onlineUsers: [],
  notification: [],
  answer: null,
  editMessage: null,
  // State setters
  setAnswer: (answer) => set({ answer }),
  setEditMessage: (editMessage) => set({ editMessage }),
  setNotification: (notification) => set({ notification }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setChannels: (channels) => set({ channels }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress) =>
    set({ fileDownloadProgress }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setDirectMessages: (directMessages) => set({ directMessages }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),

  // Close chat functionality
  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),

  // Add channel
  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [...channels, channel] }); // Ensure immutability
  },

  // Add message to selected chat
  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "channel"
              ? message.sender
              : message.sender._id,
        },
      ],
    });
  },

  // Add channel at the top of the channel list
  addChannelInChannelList: (message) => {
    const channels = get().channels;
    const channelToUpdate = channels.find(
      (channel) => channel._id === message.channelId
    );

    if (channelToUpdate) {
      const updatedChannels = [
        channelToUpdate,
        ...channels.filter((channel) => channel._id !== message.channelId),
      ];
      set({ channels: updatedChannels });
    }
  },

  // Add contacts in direct messages list (DM)
  addContactsDminContacts: (message) => {
    const userId = get().userInfo._id;
    const fromId =
      message.sender._id === userId
        ? message.recipient._id
        : message.sender._id;
    const fromData =
      message.sender._id === userId ? message.recipient : message.sender;
    const dmContacts = get().directMessages;

    const updatedDirectMessages = [
      fromData,
      ...dmContacts.filter((contact) => contact._id !== fromId),
    ];

    set({ directMessages: updatedDirectMessages });
  },
});
