import { API_CHAT_TYPES } from "../../../telegram-tt/src/config";
import type { ApiBotInfo } from "./bots";
import type {
  ApiBusinessIntro,
  ApiBusinessLocation,
  ApiBusinessWorkHours,
} from "./business";
import type { ApiPeerColor } from "./chats";
import type { ApiDocument, ApiPhoto } from "./messages";
import { OptionalCombine } from "./misc";

export interface ApiUser {
  id: string;
  isMin: boolean;
  isSelf?: true;
  isVerified?: true;
  isPremium?: boolean;
  isCloseFriend?: boolean;
  isContact?: true;
  isSupport?: true;
  type: ApiUserType;
  firstName?: string;
  lastName?: string;
  noStatus?: boolean;
  usernames?: ApiUsername[];
  phoneNumber: string;
  accessHash?: string;
  hasVideoAvatar?: boolean;
  avatarHash?: string;
  photos?: ApiPhoto[];
  botPlaceholder?: string;
  canBeInvitedToGroup?: boolean;
  commonChats?: {
    ids: string[];
    maxId: string;
    isFullyLoaded: boolean;
  };
  fakeType?: ApiFakeType;
  isAttachBot?: boolean;
  emojiStatus?: ApiEmojiStatus;
  areStoriesHidden?: boolean;
  hasStories?: boolean;
  hasUnreadStories?: boolean;
  maxStoryId?: number;
  color?: ApiPeerColor;
  canEditBot?: boolean;
}

export interface ApiUserFullInfo {
  isBlocked?: boolean;
  bio?: string;
  commonChatsCount?: number;
  pinnedMessageId?: number;
  botInfo?: ApiBotInfo;
  profilePhoto?: ApiPhoto;
  fallbackPhoto?: ApiPhoto;
  personalPhoto?: ApiPhoto;
  noVoiceMessages?: boolean;
  premiumGifts?: ApiPremiumGiftOption[];
  isTranslationDisabled?: true;
  areAdsEnabled?: boolean;
  hasPinnedStories?: boolean;
  isContactRequirePremium?: boolean;
  birthday?: ApiBirthday;
  personalChannelId?: string;
  personalChannelMessageId?: number;
  businessLocation?: ApiBusinessLocation;
  businessWorkHours?: ApiBusinessWorkHours;
  businessIntro?: ApiBusinessIntro;
}

export type ApiFakeType = "fake" | "scam";

export type ApiUserType =
  | "userTypeBot"
  | "userTypeRegular"
  | "userTypeDeleted"
  | "userTypeUnknown";

export interface ApiUserStatus {
  type:
    | "userStatusEmpty"
    | "userStatusLastMonth"
    | "userStatusLastWeek"
    | "userStatusOffline"
    | "userStatusOnline"
    | "userStatusRecently";
  wasOnline?: number;
  expires?: number;
  isReadDateRestrictedByMe?: boolean;
  isReadDateRestricted?: boolean;
}

export interface ApiUsername {
  username: string;
  isActive?: boolean;
  isEditable?: boolean;
}

export type ApiChatType = (typeof API_CHAT_TYPES)[number];
export type ApiAttachMenuPeerType = "self" | ApiChatType;

type ApiAttachBotForMenu = {
  isForAttachMenu: true;
  attachMenuPeerTypes: ApiAttachMenuPeerType[];
};

type ApiAttachBotBase = {
  id: string;
  shouldRequestWriteAccess?: boolean;
  shortName: string;
  isForSideMenu?: true;
  isDisclaimerNeeded?: boolean;
  icons: ApiAttachBotIcon[];
  isInactive?: boolean;
};

export type ApiAttachBot = OptionalCombine<
  ApiAttachBotBase,
  ApiAttachBotForMenu
>;

export interface ApiAttachBotIcon {
  name: string;
  document: ApiDocument;
}

export interface ApiPremiumGiftOption {
  months: number;
  currency: string;
  amount: number;
  botUrl: string;
}

export interface ApiEmojiStatus {
  documentId: string;
  until?: number;
}

export interface ApiBirthday {
  day: number;
  month: number;
  year?: number;
}
