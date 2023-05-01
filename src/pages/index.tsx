import { type NextPage } from "next";
import Image from "next/image";
import { SignInButton, useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { type RouterOutputs, api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading-spinner";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { PageLayout } from "~/components/layout";

dayjs.extend(relativeTime);

const Home: NextPage = () => {
  const { isSignedIn, isLoaded: userLoaded } = useUser();

  // start fetching ASAP
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      {!isSignedIn ? (
        <div className="flex justify-center">
          <SignInButton />
        </div>
      ) : (
        <div className="flex border-b border-slate-400 p-4">
          <CreatePostWizard />
        </div>
      )}
      <Feed />
    </PageLayout>
  );
};

export default Home;

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if (postLoading) {
    return (
      <div className="flex grow items-center justify-center">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <Post key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const Post = (props: PostWithUser) => {
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

const CreatePostWizard = () => {
  const [input, setInput] = useState("");
  const { user } = useUser();
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (error) => {
      const [errorMessage] = error.data?.zodError?.fieldErrors?.content ?? [];

      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutate({ content: input });
  };

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="profile image"
        className="h-14 w-14 rounded-full"
        width={56}
        height={56}
      />
      <form className="flex grow gap-3" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="type some emojis!"
          className="grow bg-transparent outline-none"
          value={input}
          disabled={isPosting}
          onChange={(event) => setInput(event.currentTarget.value)}
        />
        <button type="submit" disabled={isPosting}>
          {isPosting ? <LoadingSpinner /> : "post"}
        </button>
      </form>
    </div>
  );
};
