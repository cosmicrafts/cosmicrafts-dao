# Architecture

![DAO Architecture](architecturebanner.webp)

Cosmicrafts represents a paradigm shift in blockchain gaming with its architecture **built entirely on blockchain**, leveraging the [unparalleled capabilities](https://genfinity.io/2024/07/19/a-conversation-with-dfinitys-cto-jan-camenisch/) for [scalability](https://internetcomputer.org/capabilities/limitless-scaling), [cost-efficiency](https://www.reddit.com/r/devops/comments/1cwi1gn/when_did_the_cloud_become_so_stupid_expensive/), and [decentralized infrastructure](https://internetcomputer.org/how-it-works) of the **Internet Computer**. 

Unlike traditional games reliant on [centralized servers](https://www.geeksforgeeks.org/comparison-centralized-decentralized-and-distributed-systems/), Cosmicrafts' architecture resides on a [decentralized network of datacenters](https://internetcomputer.org/node-providers), positioned strategically around the globe, eliminating [single points of failure](https://en.wikipedia.org/wiki/Single_point_of_failure) through [cryptographic consensus](https://crypto.com/en/university/consensus-mechanisms-explained).


>This section outlines the key [architectural components](https://en.wikipedia.org/wiki/Software_architecture) of Cosmicrafts, showcasing its technical superiority over traditional software architectures.
---


## Fully On-Chain

All [critical operations](https://tokenminds.co/blog/web3-development/the-benfefits-of-on-chain-web) are conducted entirely on-chain, ensuring transparency, security, and scalability.

> You can [view our public smart contracts on the Internet Computer dashboard](https://dashboard.internetcomputer.org/canister/opcce-byaaa-aaaak-qcgda-cai) along with our [open-source code](https://github.com/worldofunreal/cosmicrafts-motoko-backend) to explore how we achieve this level of trust and decentralization.

![DAO On-chain Architecture](archfullyonchain.webp)

### Key Components of Fully On-Chain Architecture

#### **1. Web App ([User Frontend](https://elevatex.de/blog/it-insights/frontend-explained/))**
- Provides a graphic interface for players to interact with the game.
- Fetches real-time data from on-chain component.
- Designed for accessibility across devices with responsive UI.

#### **2. DAO ([SNS Canisters](https://internetcomputer.org/docs/current/developer-docs/daos/sns/overview))**
- **Governance:** Enables stakeholder decision-making.
- **Ledger:** Manages token transactions, with recorded and transparent operations.
- **Index:** Provides a comprehensive map of stakeholder activity.
- **Root:** Oversees upgrading other SNS canisters and the Core canisters that the SNS governs.

#### **3. Game Logic ([Core Canisters](https://dashboard.internetcomputer.org/canister/opcce-byaaa-aaaak-qcgda-cai))**
- **Rewards:** Automates distribution of in-game rewards like XP, tokens and NFTs.
- **Matchmaking:** Facilitates real-time player pairing based on skill levels.
- **Statistics:** Tracks game progress, leaderboards, and player achievements.
- **Progress:** Stores player states and ensures continuity across games.

#### **4. Economy Canisters ([ICRCs](https://github.com/dfinity/ICRC))**
- **Tokens:** The tokens for in-game transactions, compatible with DEXs and CEXs for trading.
- **NFTs:** Handles dynamic metadata, enabling upgrades, rarity traits, and cross-game utilities.

>This architecture ensures trust, enhances transparency, and establishes a robust foundation for expanding the Cosmicrafts ecosystem.

---

## Advanced Internet Computer Features

The **Internet Computer** stands apart from other [blockchains](https://chainspect.app/compare/icp-vs-solana) by eliminating the need for traditional cloud services to operate at scale. Its [architecture](https://internetcomputer.org/how-it-works/architecture-of-the-internet-computer/) allows it to run applications natively on-chain, combining the speed and ease of cloud platforms with the trust and transparency of blockchain. 

### 1. Scalability
- **Dynamic Resource Allocation**: Automatically adapts to meet [growing demand]().  
- **Concurrent Users**: Supports a [huge number](https://internetcomputer.org/capabilities/limitless-scaling) of users without breaking.  

### 2. Speed and Performance
- **Near-Instant Transactions**: Operations are [fast](https://medium.com/dfinity/the-internet-computers-transaction-speed-and-finality-outpace-other-l1-blockchains-8e7d25e4b2ef#:~:text=The%20Internet%20Computer's%20performance%20evaluation,with%20a%201%2Dsecond%20finality.), responsive, and natural.  
- **Web-Speed**: Feels as [smooth](https://www.reddit.com/r/dfinity/comments/mum43f/how_fast_is_dfinity_exatcly/?rdt=38691) as any modern application.

### 3. Cost-Effectiveness (Reverse Gas Model)
- **Zero Fees for Users**: Players don’t need [wallets](https://internetcomputer.org/docs/current/developer-docs/defi/wallets/overview) or [tokens](https://www.coinbase.com/learn/crypto-basics/what-are-gas-fees)—just jump in.  
- **Affordable for Developers**: [Transaction costs](https://internetcomputer.org/docs/current/developer-docs/gas-cost) are [lower](https://icp.guide/costs-on-the-internet-computer/) than traditional blockchains or cloud solutions.  

### 4. Security
- **Cryptographic Protection**: Transactions are secured through [advanced cryptography](https://support.dfinity.org/hc/en-us/articles/360057605551-What-is-chain-key-cryptography).
- **Global Redundancy**: Data is [distributed](https://internetcomputer.org/docs/current/developer-docs/getting-started/network-overview) worldwide, removing single points of failure.

### 5. Developer-Friendly Infrastructure
- **Powerful Tools**: Frameworks like [dfx](https://github.com/dfinity/sdk), [agent-js](https://github.com/dfinity/agent-js), [ICP.NET](https://github.com/BoomDAO/ICP.NET), and [Motoko](https://github.com/dfinity/motoko) simplify development.  
- **Community and Grants**: Supported by DFINITY’s [funding](https://dfinity.org/grants) and a thriving [developer network](https://forum.dfinity.org/).  
- **Expert R&D**: Backed by one of the most [innovative teams](https://dfinity.org/#team) in the tech industry.


>This eliminates many of the limitations found in other blockchains and cloud services, creating a foundation for faster, more efficient, and more secure applications.


![DAO Architecture2](archimg2.webp)

## Canister Architecture

The **Internet Computer** introduces a new approach to smart contracts through its **canister architecture**. [Canisters](https://internetcomputer.org/docs/current/tutorials/developer-journey/level-0/intro-canisters) are the Internet Computer’s version of smart contracts, designed to provide greater functionality and scalability than traditional blockchain contracts.

### **What Are Canisters?**
- **Smart Contracts on Steroids**: [Canisters](https://internetcomputer.org/docs/current/developer-docs/smart-contracts/overview/introduction) are a combination of code (logic) and state (data), encapsulated in a way that makes them highly efficient for decentralized applications.
- **Self-Sufficient Units**: Each canister contains everything it needs to execute functions, interact with other canisters, and process user requests.
- **Unlimited Capacity**: Canisters can dynamically grow in size, supporting large-scale applications without hitting traditional blockchain limitations.

### **How Canisters Enable Smart Contracts**
- **Native Execution**: Canisters are directly hosted and [executed](https://es.quarkus.io/guides/building-native-image) on the Internet Computer, eliminating the need for external servers or cloud solutions.
- **High Performance**: Unlike traditional blockchains that process transactions in batches, canisters can handle [multiple requests concurrently](https://dashboard.internetcomputer.org/canisters), enabling real-time interactions and near-instant responses.
- **Scalable Design**: Canisters scale automatically with demand, ensuring consistent performance as applications grow.

### **Developer-Friendly Features**
- **Flexible Language Support**: Canisters can be developed using [Motoko](https://github.com/dfinity/motoko) or [Rust](https://www.rust-lang.org/), serving diverse developer needs.
- **Interoperability**: Canisters integrate seamlessly with other on-chain and off-chain services, enabling a wide range of use cases.
- **Continuous Improvement**: The architecture is actively maintained and improved by the [DFINITY Foundation](https://dfinity.org/), ensuring cutting-edge performance and features.


>With canisters at its core, the Internet Computer redefines what smart contracts can achieve, supporting complex applications such as games, DeFi platforms, and enterprise-grade systems—all [without relying on traditional cloud infrastructure](https://internetcomputer.org/docs/current/tutorials/developer-journey/level-1/1.6-managing-canisters).


## Smart Contracts

### Motoko
Cosmicrafts backend is coded in the Internet Computer’s native programming language, [Motoko](https://github.com/dfinity/motoko), it powers advanced smart contracts with the following features:

- **Robust Security**: Built specifically for blockchain, it includes features like [type checking](https://internetcomputer.org/docs/current/motoko/main/getting-started/basic-concepts) and [memory safety](https://internetcomputer.org/docs/current/motoko/main/stable-memory/stablememory) to minimize vulnerabilities.
- **Optimal Performance**: Motoko canisters are [compiled, not interpreted](https://www.freecodecamp.org/news/compiled-versus-interpreted-languages/), producing small binaries with good performance.
- **Continuous Evolution**: Actively maintained by the [DFINITY Foundation’s R&D team](https://dfinity.org/#team) with regular updates and new features.

### NFTs
Cosmicrafts employs the [iCRC-7 standard](https://github.com/dfinity/ICRC/blob/main/ICRCs/ICRC-7/ICRC-7.md) for its **Non-Fungible Tokens (NFTs)**, offering features that go beyond basic ownership representation:

- **Programmability**: iCRC-7 NFTs support custom smart contracts, enabling dynamic behavior and functionality.
- **Interoperability**: These NFTs are designed to function with other dApps built on the Internet Computer, promoting an interconnected ecosystem.
- **Improved Security**: The iCRC-7 standard incorporates best practices for security, minimizing vulnerabilities and ensuring the safety of assets.
- **Metadata Standards**: iCRC-7 includes robust and standardized metadata storage mechanisms, ensuring accurate, consistent, and easily searchable information associated with NFTs, enhancing their discoverability and usability.

### Tokens
The native Spiral token adheres to the [iCRC standards](https://internetcomputer.org/docs/current/developer-docs/defi/tokens/token-standards) with the following benefits:

- **Standard Compliance**: Ensures compliance with Internet Computer infrastructure and other dApps.
- **Exchange Integration**: Designed for compatibility on both centralized (CEX) and decentralized exchanges (DEX).

## Frontend Integration

The [frontend architecture](https://www.maibornwolff.de/en/know-how/good-frontend-architecture/) focuses on delivering a responsive and efficient experience using modern technologies.

### Web and Game Clients
Lightweight clients retrieve data directly from the blockchain for real-time updates:

#### Unity for Game Development:
  - Supports [cross-platform compatibility](https://unity.com/solutions/multiplatform), targeting web, desktop, and mobile platforms with one codebase.
  - Uses [WebAssembly and WebGL](https://docs.unity3d.com/6000.1/Documentation/Manual/webgl-intro.html) for high-performance browser gameplay.
  - Offers a vast [ecosystem of plugins and tools](https://assetstore.unity.com/) to accelerate development.
  - Enables real-time [rendering capabilities](https://docs.unity3d.com/6000.0/Documentation/Manual/render-pipelines-overview.html) for visually stunning graphics.

### Cross-Platform Compatibility
The Internet Computer makes it easy to access games across different platforms, no matter where you play:

- **Web Browsers**:
  - **Decentralized Hosting**: The entire game can be [hosted](https://internetcomputer.org/capabilities/serve-web-content/) on the Internet Computer’s, so there’s no need for traditional servers.
  - **Performance**: [WebAssembly](https://medium.com/dfinity/webassembly-on-the-internet-computer-a1d0c71c5b94) run almost as [fast](https://www.adservio.fr/post/how-fast-and-efficient-is-wasm) as they would on your own device, even for demanding applications.
  - **Data Integrity**: On-chain hosting guarantees the data is secure and can’t be hacked.
  - **Accessibility**: Games run directly in browsers, avoiding the need for large downloads.

- **Desktop Clients**: Optimized apps are available for PC, Mac, and Linux, giving players extra features and better performance when they want a richer experience.
- **Mobile Games**: Mobile versions let players enjoy the game on the go while keeping the experience consistent with other platforms.

### Interaction Diagram

![DAO Architecture Diagram](archdiagram.webp)

### Layers Explained

### 1. **Frontend Layer**
The **User Layer** represents the entry point for users, allowing them to access Cosmicrafts, includes lightweight and optimized user interfaces that:
- **Mobile**: Players can use smartphones or tablets to connect to the game via dedicated apps or browser-based interfaces.
- **Desktop**: Desktop users enjoy the full gaming experience through web browsers or standalone clients.
- **Web Application**: Offer web-based access from within the blockchain without downloading additional software.

### 2. **Backend Layer**
The **Backend Layer** is powered entirely by the **Internet Computer** and handles all critical operations, including:
- **Governance**: Implements the DAO for decentralized decision-making and voting mechanisms.
- **Game Logic**: Manages all in-game mechanics, rules, and interactions directly on-chain.
- **Assets**: Handles NFT management, in-game currency, and other digital assets.

---

## Future Expansions

The architecture is designed to evolve with ICP's latest integrations:

### Cross-Chain Interoperability
The **Internet Computer (ICP)** is leading the way in building a **multichain** future, where blockchains are no longer isolated but interconnected networks. While ICP serves as the foundation, its [Chain Fusion technology]((https://internetcomputer.org/chainfusion)) enables integration with other blockchains, unlocking new possibilities for developers and users.


### On-Chain AI
Additional features, such as advanced **AI-driven gameplay** along with advanced **data analytics**, will be supported by ICP's evolving capabilities, enabling smart contracts to directly run [AI models on-chain](https://internetcomputer.org/ai). This innovation unlocks a range of possibilities as ICP evolves, the potential for integrating AI into decentralized applications grows exponentially.

### Developer Tools

The roadmap includes plans to integrate [development kits](https://github.com/dfinity/awesome-internet-computer) from partners and third-party developers into Cosmicrafts. These tools aim to enhance the developer experience and expand the project's ecosystem. 

#### Key integrations include:

- **[ORIGYN](https://www.origyn.com/)**: An **RWA blockchain protocol** providing advanced tools for tokenizing real-world and digital assets, ensuring transparency, fractional ownership, and secure asset certification through its fully on-chain platform.
- **[BOOM DAO](https://docs.boomdao.xyz/)**: A collective dedicated to building foundational infrastructure for **fully on-chain games**. Developers can integrate the **World Protocol** as a "game server" using BOOM DAO's World canisters.
- **[OpenChat](https://oc.app/home)**: Enabling **decentralized communication** tools like chat and voice chat that allow for real-time interactions, powered entirely by the Internet Computer.
- **[Dmail](https://dmail.ai/)**: An AI-powered decentralized communication platform offering **encrypted emails**, cross-chain notifications, and NFT domain accounts. Dmail integrates secure messaging, asset interactions, and notifications.
- **[Neutrinite](https://icpcoins.com)**: A DAO-controlled platform **sourcing data** from DEXes, DAOs, and DeFi applications, promoting transparency and innovation in the ecosystem.  
 - **[Bitfinity](https://bitfinity.network/)**: A high-performance Bitcoin **Layer-2 platform** offering fast transactions, EVM compatibility, and tools like BitFusion SDK for seamless cross-chain development.
 - **[WaterNeuron](https://waterneuron.fi/)**: A **liquid staking protocol** for the Internet Computer that provides nICP tokens, allowing users to earn NNS rewards while maintaining liquidity for DeFi applications.

>These integrations empower developers to build, innovate, and expand the functionalities with a collaborative and thriving ecosystem.
