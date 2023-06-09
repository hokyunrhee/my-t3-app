import {
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticPropsContext,
  type NextPage,
} from "next";
import Image from "next/image";
import Head from "next/head";

import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading-spinner";
import { Post } from "~/components/post";
import { PageLayout } from "~/components/layout";
import { generateSSGHelpers } from "~/server/helpers/ssg-helpers";

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  username,
}) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (isLoading) return <div>Loading...</div>;

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>

      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-xl font-bold">{`@${data.username ?? ""}`}</div>

        <div className="border-b border-slate-400" />

        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export default ProfilePage;

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading)
    return (
      <div className="flex grow items-center justify-center">
        <LoadingSpinner size={60} />
      </div>
    );

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <Post key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

export const getStaticProps = async (
  context: GetStaticPropsContext<{ slug: string }>
) => {
  const helpers = generateSSGHelpers();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("No slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
