import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	srcDir: "src",

	title: "HomeLab",
	description: "My experiments",

	// https://vitepress.dev/reference/default-theme-config
	themeConfig: {
		sidebar: [
			{
				text: "k8s",
				items: [{ text: "Setup with Talos", link: "/k8s/talos" }],
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/tednaaa/homelab" },
		],
	},
});
