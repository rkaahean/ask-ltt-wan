import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";

export const Navbar = () => {
  return (
    <div className="flex flex-row h-10 justify-center bg-black gap-5 my-3">
      <a
        className="bg-black hover:bg-black text-stone-800 hover:text-orange-500"
        href="www.github.com/rkaahean"
        target="_blank"
      >
        <GitHubLogoIcon className="h-8 w-8" />
      </a>
      <a
        className="bg-black hover:bg-black text-stone-800 hover:text-orange-500"
        href="www.twitter.com/rkaahean"
        target="_blank"
      >
        <TwitterLogoIcon className="h-8 w-8" />
      </a>
    </div>
  );
};
