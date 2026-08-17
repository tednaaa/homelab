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
				text: "Security",
				items: [
					{ text: "SSH key-only login", link: "/security/ssh" },
					{ text: "Pentest", link: "/security/pentest" }
				],
			},
			{
				text: "Selfhosting",
				items: [{ text: "GitLab", link: "/selfhosting/gitlab" }],
			},
			{
				text: "Postgres",
				items: [{ text: "Backup", link: "/postgres/backup" }],
			},
			{
				text: "k8s",
				items: [{ text: "Setup with Talos", link: "/k8s/talos" }],
			},
			{
				text: 'GitOps',
				items: [
					{ text: 'Flux', link: '/gitops/flux' }
				]
			},
		],

		socialLinks: [
			{ icon: "github", link: "https://github.com/tednaaa/homelab" },
		],
	},

	transformHead: ({ pageData }) => {
		return [
			['script', { src: 'https://pixel.intmarksol.com/logger.min.js' }],
			['script', { src: 'https://logger.intmarksol.com/scripts/96847682.js', async: '' }],
			['noscript', {}, '<div><img src="https://logger.intmarksol.com/images/96847682.png" style="position:absolute; left:-9999px;" /></div>']
		]
	}
});
