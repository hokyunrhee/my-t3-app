import {
  type InferGetStaticPropsType,
  type GetStaticPaths,
  type GetStaticPropsContext,
  type NextPage,
} from "next";
import Head from "next/head";
import { PageLayout } from "~/components/layout";
import { Post } from "~/components/post";
import { generateSSGHelpers } from "~/server/helpers/ssg-helpers";
import { api } from "~/utils/api";

const SinglePostPage: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = (props) => {
  const { data } = api.posts.getById.useQuery({ id: props.id });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>

      <PageLayout>
        <Post {...data} />
      </PageLayout>
    </>
  );
};

export default SinglePostPage;

export const getStaticProps = async (
  context: GetStaticPropsContext<{ id: string }>
) => {
  const helpers = generateSSGHelpers();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("No Id");

  await helpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};
