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

  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),

  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [...channels, channel] });
  },

  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient: message.recipient._id,
          sender: message.sender._id,
        },
      ],
    });
  },

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
