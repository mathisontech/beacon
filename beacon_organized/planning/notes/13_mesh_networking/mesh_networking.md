## 6. Mesh Networking System

## Still Needs Research
- Deep learning compression algorithms for mesh-scale bandwidth
- Delta encoding for map tile updates
- Group distribution modeling vs. individual data points
- Mesh traffic prioritization under severe bandwidth constraints
- Simplified map generation for offline scenarios
- EMS network integration architecture
- Starlink latency and integration feasibility
- Ring partnership coverage area expansion
- Mesh encryption overhead and performance trade-offs
- Message delivery confirmation at scale

---

Activates when cell towers are down.

### 6.1 Core Capabilities

- **Traffic routing:** Intelligent message routing across the mesh
- **Compression algorithms:** Minimize data size for constrained bandwidth
- **Bandwidth management:** Dynamically turn on/off user features depending on available bandwidth
- **Battery management:** Minimize drain during emergencies; low battery mode
- **Encryption & safety protocols:** Secure data sharing across the mesh
- **Alert confirmation relay:** Relay back to emergency services that alerts were received by users

### 6.2 Mesh Traffic Management

- **Delta encoding:** Use delta encoding wherever possible to minimize transmission size
- **Group representation:** Represent groups of people by distributions rather than individual data points
- **DL-based compression:** Use deep learning for compression wherever possible (research required)
- **Standardized messages:** Adjust standard observations, map tags, and standard messages depending on the nature of the emergency. Standard messages can be heavily compressed. Standardized messages always get priority over custom messages. Users should always see if their message was delivered and be notified to try a standardized message after a timeout.
- **Traffic priority ordering:** EMS traffic goes first. Help requests before tags. Order all network traffic based on necessity. Prioritize showing EMS where stuck/help-needed people are.
- **Simplified map download:** Can a user download a simplified map over the mesh if they don't have the app and service is down?

### 6.3 Mesh Partnerships & Expansion

- Can existing EMS networks be integrated later?
- Starlink partnership for bandwidth augmentation
- Ring partnership to extend mesh coverage and monitor for looters/arsonists

---

