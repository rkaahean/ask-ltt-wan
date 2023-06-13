import { GitHubLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';

export const Navbar = () => {
	return (
		<div className="flex flex-row h-10 w-full justify-center bg-black gap-5 my-3">
			<a
				className="text-stone-700 hover:text-orange-500"
				href="https://www.github.com/rkaahean"
				target="_blank"
			>
				<GitHubLogoIcon className="h-8 w-8" />
			</a>
			<a
				className="text-stone-700 hover:text-orange-500"
				href="https://www.twitter.com/rkaahean"
				target="_blank"
			>
				<TwitterLogoIcon className="h-8 w-8" />
			</a>
		</div>
	);
};
