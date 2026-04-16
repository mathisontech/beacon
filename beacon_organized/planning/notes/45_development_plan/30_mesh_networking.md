# Mesh Networking Module

## 1. Overview
Operates when cell towers are down. Routes messages across BLE mesh, WiFi Direct, and LoRa layers with intelligent compression, battery budgeting, and EMS priority traffic handling. Enables offline-first communication with Starlink/Ring doorbell integration for expanded coverage.

## 2. Ownership
- Director: Mesh Network Operations
- Leads: Protocol Implementation, Peer Discovery, Routing Engine, Battery Management, Compression, EMS Integration, Starlink Partnership, Ring Integration

## 3. Parent Module
Networking & Infrastructure. Supports all modules during carrier outages.

## 4. Submodules
- BLE Mesh Layer
- WiFi Direct Layer
- LoRa Layer
- Compression Engine
- Battery Manager
- Offline Sync Queue

## 5. Goals
1. Maintain connectivity when carriers down
2. Deliver EMS traffic <500ms through mesh
3. Reduce payload 70-90% via compression
4. Route around failed peers automatically
5. Sustain mesh node operation on 12h battery
6. Reach 5+ km range via LoRa relay

## 6. Functions

| Function | Purpose | Input | Output | SLA | Dependencies |
|----------|---------|-------|--------|-----|--------------|
| discover_peers | Find nearby mesh nodes via BLE scan | Region radius | Peer list (ID, signal, caps) | 5s | BLE radio |
| establish_ble_link | Create BLE mesh connection | Peer ID, auth token | Connected state | 2s | BLE stack |
| establish_wifi_direct_link | Form WiFi Direct group | Peer ID, SSID | Connected state | 3s | WiFi Direct driver |
| establish_lora_link | Register LoRa peer | Device ID, freq | Registered state | 1s | LoRa modem |
| route_message | Find best path through mesh | Message, dest_id | Routed message + next_hop | 50ms | Routing table |
| select_routing_strategy | Choose BLE/WiFi/LoRa per metric | Available peers, msg_size | Strategy choice | 10ms | Strategy config |
| compute_relay_path | Calculate multi-hop route | Start node, end node | Path array | 100ms | Topology map |
| broadcast_mesh_message | Flood message to all peers | Message, TTL | Hop count | 200ms | BLE mesh |
| compress_payload_protobuf | Encode with Protocol Buffers | JSON object | Binary buffer | 5ms | protobuf lib |
| compress_payload_zstd | Compress with Zstd | Binary buffer | Compressed bytes | 10ms | zstd lib |
| decompress_payload | Reverse compression | Compressed bytes | Original data | 10ms | zstd lib |
| detect_payload_type | Classify message for compression | Message content | Compression algo | 1ms | Type rules |
| estimate_compressed_size | Predict final size | Original size, type | Predicted bytes | 1ms | Model |
| estimate_transmission_time | Calculate link time | Message bytes, link_speed | Time estimate | 1ms | Link stats |
| prioritize_ems_traffic | Rank EMS above other msgs | Message queue | Reordered queue | 5ms | Priority rules |
| classify_message_urgency | Assign tier (1-5) to msg | Message metadata | Tier (1-5) | 2ms | Classification rules |
| queue_standard_messages | Buffer pre-composed alerts | Message list | Queued count | 1ms | Queue buffer |
| drop_low_priority | Remove excess messages | Overflowing queue | Dropped count | 1ms | Drop policy |
| manage_battery_budget | Allocate transmit duty cycle | Battery %, urgency | TX time allowance | 5s | Battery model |
| reduce_transmit_power | Lower radio output | Battery %, distance | Power level | 2s | Radio config |
| disable_idle_features | Turn off non-critical tasks | Battery %, threshold | Feature state | 10s | Feature flags |
| estimate_battery_drain | Predict time-to-zero | Current %, TX/RX ratio | Hours remaining | 2s | Drain model |
| sync_offline_queue | Deliver queued messages when online | Offline message queue | Delivery status | 30s | Queue store |
| detect_connectivity_return | Notice when carrier restored | Network state | Is_online flag | 5s | Network monitor |
| merge_offline_messages | Deduplicate after sync | Local + cloud queue | Merged queue | 2s | Dedup logic |
| calculate_mesh_topology | Map peer connections | Peer scan results | Topology graph | 500ms | Graph lib |
| detect_mesh_fragments | Find disconnected clusters | Topology graph | Fragment list | 100ms | Graph search |
| rebalance_traffic | Distribute load across paths | Peer capacity map | Load distribution | 200ms | Optimizer |
| detect_route_blockage | Identify failed hops | Route status, timeouts | Blocked hops | 100ms | Health monitor |
| compute_alternate_route | Find backup path | Original route, blocked hops | Alternate path | 150ms | Routing engine |
| age_out_dead_peers | Remove unreachable nodes | Peer timeout log | Updated peer list | 5s | Timeout config |
| track_peer_statistics | Record hop success rate | Send/receive logs | Peer stats | 1s | Stats store |
| select_backup_peers | Identify redundant nodes | Peer stats, topology | Backup peer set | 50ms | Selection rules |
| test_backup_connectivity | Verify alternate routes work | Backup paths | Test results | 100ms | Ping packets |
| encode_emergency_message | Format high-priority alert | Alert data | Encoded msg | 2ms | Encoding spec |
| broadcast_wide_message | Spread message across mesh | High-priority msg, TTL | Broadcast count | 300ms | Broadcast engine |
| confirm_ems_delivery | Log when EMS received alert | Message ID, peer | Confirmation logged | 5s | Delivery log |
| request_message_resend | Ask for missing packet | Message ID | Resend request | 2ms | Request format |
| log_undeliverable | Record failed message | Message ID, reason | Logged | 1s | Event log |

## 7. Data Storage

| Table | Purpose | Key Fields | Retention |
|-------|---------|-----------|-----------|
| mesh_peers | Peer registry | peer_id, device_type, last_seen, signal_strength | 7 days |
| peer_capabilities | Node capabilities | peer_id, max_msg_size, battery_level, supported_protocols | 7 days |
| peer_statistics | Hop success rate | peer_id, successful_relays, failed_relays, timestamp | 30 days |
| routing_table | Next-hop decisions | dest_id, next_hop_id, path_quality, last_updated | 1 day |
| offline_queue | Messages awaiting delivery | message_id, recipient, content, enqueued_at, priority | Until delivered |
| delivery_log | Mesh delivery audit | message_id, peer_id, delivered_at, hops, compression_ratio | 6 months |
| mesh_topology | Network graph snapshots | snapshot_id, topology_json, timestamp, fragment_count | 7 days |

## 8. Message Bus (NATS)
- `mesh.peer.discovered`: New peer found
- `mesh.peer.lost`: Peer disconnected
- `mesh.route.blocked`: Path failed
- `mesh.message.queued`: Message buffered offline
- `mesh.message.delivered`: Message relayed
- `mesh.battery.warning`: Low battery threshold
- `mesh.connectivity.restored`: Carrier network returned
- `ems.message.priority`: EMS traffic on mesh

## 9. Cache (Redis)
- `peer:{peer_id}`: Current peer state
- `topology:current`: Live mesh topology
- `route:{dest_id}`: Cached next-hop
- `battery:{device_id}`: Current battery % and drain rate
- `offline_queue:{device_id}`: Pending messages

## 10. External Integrations
- BLE mesh stack (Nordic Semiconductor or equivalent)
- WiFi Direct (Android/iOS native)
- LoRa modem firmware (Semtech SX1262 or equivalent)
- Starlink satcom API for bandwidth augmentation
- Ring API for doorbell mesh relay points
- EMS dispatch systems for priority traffic confirmation

## 11. API Contracts
Consumed by: All modules, especially Notifications, Evacuation Routing, EMS Client
Provides: sendMeshMessage(), getPeerList(), getTopology(), requestDeliveryConfirmation()
Mesh broadcast subjects: `alert.mesh.broadcast`, `ems.request.mesh`

## 12. UI Components
- Mesh connectivity status badge (Navy #0B0F2A bg, Teal #0097B2 indicator when connected)
- Peer signal strength map view
- Battery drain indicator (color intensity per duty cycle)
- Offline mode banner (full-width alert during carrier outage)

## 13. Offline & Mesh Behavior
- Full mesh operation when cellular down
- Offline queue persisted to device storage (max 100MB)
- Messages re-sent on connectivity return
- Simplified map tiles cached (5GB delta for offline access)
- Standard pre-composed alerts prioritized in compression
- EMS messages always route first
- Battery optimization: reduce map refresh, disable background sync

## 14. Cost Breakdown
- LoRa modem licensing: ~$3K/yr
- BLE stack licensing: Included in chipset
- Starlink partnership: TBD (bandwidth augmentation)
- Ring integration: TBD (relay coverage expansion)
- Processing compute (routing, compression): ~$5K/yr

## 15. Monitoring & Metrics

| Agent | Metrics |
|-------|---------|
| Quality | Message delivery rate, end-to-end latency, compression ratio (target 75%), topology stability |
| Research | LoRa range improvements, Starlink integration feasibility, new compression algos (DL-based) |
| Business | Mesh coverage expansion, Ring partner agreement progress, cost per delivered message |
| Compliance | Mesh encryption overhead, secure peer auth audit, delivery confirmation audit trail |
| Lead | Daily mesh health summary, peer stability, offline queue backlog, EMS delivery SLA |

## 16. Dependencies
- BLE mesh implementation (Nordic SDK or open-source)
- WiFi Direct drivers (system native)
- LoRa modem firmware + API
- Protocol Buffers library
- Zstd compression library
- Graph algorithms (routing, topology analysis)
- Message bus (NATS) for integration
- Redis cache for peer state
- Secure random number generator (for peer auth tokens)
