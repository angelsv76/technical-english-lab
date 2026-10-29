import { Blobatar } from '@blobatar/react';

type Props = {
  name: string;
  photoUrl?: string | null;
  size: number;
  className?: string;
};

export function StudentAvatar({ name, photoUrl, size, className = '' }: Props) {
  return photoUrl ? (
    <img src={photoUrl} alt="" width={size} height={size} className={className} />
  ) : (
    <Blobatar name={name} size={size} alt="" className={className} />
  );
}
