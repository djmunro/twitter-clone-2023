import prisma from "@/lib/db";
import { Post as PostType, User as UserType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { formatDistance } from "date-fns";

type ExtendedPostType = PostType & {
  author: {
    name: string;
  };
};

interface PostsProps {
  posts: ExtendedPostType[];
}

async function getPosts() {
  return await prisma.post.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

async function submit(formData: FormData) {
  "use server";
  const content = formData.get("content") as string;
  console.log(content);
  await prisma.post.create({
    data: {
      authorId: 1, // TODO: get from session
      content,
    },
  });
  revalidatePath("/");
}

function AddPost() {
  return (
    <form action={submit} className="flex flex-col">
      <input
        name="content"
        placeholder="What is happening?!"
        className=" border-2 p-2 rounded hover:border-violet-600 active:border-violet-700 focus:outline-none focus:ring focus:ring-violet-300"
      />
      <button className="rounded mt-2 px-2 py-1 bg-violet-300 hover:bg-violet-400 text-violet-700 focus:outline-none ml-auto ">
        Post
      </button>
    </form>
  );
}

function Posts({ posts }: PostsProps) {
  const getDate = (createdAt: Date) =>
    formatDistance(new Date(createdAt), new Date(), {
      addSuffix: true,
    });

  return (
    <div className="post">
      <ul role="list" className="divide-y divide-gray-300">
        {posts.map((post) => (
          <li key={post.id} className="flex justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4">
              <div className="min-w-0 flex-auto">
                <p>
                  {post.author.name} · {getDate(post.createdAt)}
                </p>
                <p>{post.content}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <AddPost />
        <Posts posts={posts} />
      </div>
    </main>
  );
}
