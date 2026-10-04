import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	srcDir: "src",

	title: "HomeLab",
	description: "My experiments",

	cleanUrls: true,
	lastUpdated: true,

	// https://vitepress.dev/reference/default-theme-config
	themeConfig: {
		search: { provider: "local" },

		outline: { level: [2, 3] },

		sidebar: [
			{
				text: "Selfhosting",
				items: [
					{ text: "GitLab", link: "/selfhosting/gitlab" },
					{ text: "Vaultwarden", link: "/selfhosting/vaultwarden" },
				],
			},
			{
				text: "Workflow",
				items: [{ text: "GitLab", link: "/workflow/gitlab" }],
			},
			{
				text: "Security",
				items: [
					{ text: "Overview", link: "/security/" },
					{ text: "SSH key-only login", link: "/security/ssh" },
					{ text: "Pentest", link: "/security/pentest" },
				],
			},
			{
				text: "Certificates",
				items: [{ text: "Let's Encrypt", link: "/certificates/lets-encrypt" }],
			},
			{
				text: "Postgres",
				items: [{ text: "Backup", link: "/postgres/backup" }],
			},
			{
				text: "k8s",
				items: [
					{ text: "Cluster setup", link: "/k8s/cluster-setup" },
					{ text: "Setup with Talos", link: "/k8s/talos" },
				],
			},
			{
				text: "GitOps",
				items: [{ text: "Flux", link: "/gitops/flux/" }],
			},
		],

		editLink: {
			pattern: "https://github.com/tednaaa/homelab/edit/main/docs/src/:path",
		},

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
