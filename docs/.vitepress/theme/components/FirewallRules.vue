<script setup lang="ts">
import { computed } from 'vue';

interface FirewallRule {
	description: string;
	protocol: 'TCP' | 'UDP' | 'ICMP';
	port?: number;
}

const { direction, rules } = defineProps<{
	direction: 'inbound' | 'outbound';
	rules: FirewallRule[];
}>();

const peersHeader = computed(() => direction === 'inbound' ? 'Sources' : 'Destinations');

function formatPort(rule: FirewallRule) {
	if (rule.protocol === 'ICMP')
		return '-';
	return rule.port ?? 'All';
}
</script>

<template>
	<table>
		<thead>
			<tr>
				<th>Description</th>
				<th>Protocol</th>
				<th>Port</th>
				<th>{{ peersHeader }}</th>
			</tr>
		</thead>
		<tbody>
			<tr
				v-for="rule in rules"
				:key="`${rule.protocol}-${rule.port}`"
			>
				<td>{{ rule.description }}</td>
				<td>{{ rule.protocol }}</td>
				<td>{{ formatPort(rule) }}</td>
				<td>All IPv4, All IPv6</td>
			</tr>
		</tbody>
	</table>
</template>
