import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { type RouterOutputs } from "~/utils/api";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const Post = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profileImageUrl}
        alt={`@${author.username}`}
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <span>
            <Link href={`/@${author.username}`}>
              <span>{`@${author.username}`}</span>
            </Link>
            ·{" "}
            <Link href={`/post/${post.id}`}>
              <span className="text-slate-400">
                {dayjs(post.createdAt).fromNow()}
              </span>
            </Link>
          </span>
        </div>
        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
};
