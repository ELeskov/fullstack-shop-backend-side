export const S3_NAME_FOLDERS = {
  S3_USER_AVATAR: 'avatars',
  S3_SHOP_LOGO: 'logos',
} as const

export type S3FolderValue =
  (typeof S3_NAME_FOLDERS)[keyof typeof S3_NAME_FOLDERS]
