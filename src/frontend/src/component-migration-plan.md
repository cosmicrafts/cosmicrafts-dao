# Component Migration Plan

This document tracks the reorganization of components from the old structure to the new structure.

## Core Components
| Old Path | New Path | Description |
|----------|----------|-------------|
| `Modal.vue` | `core/modals/BaseModal.vue` | Base modal component |
| `Chat.vue` | `core/Chat.vue` | Chat functionality |
| `MarkdownRenderer.vue` | `core/MarkdownRenderer.vue` | Markdown rendering |
| `EmojiPicker.vue` | `core/EmojiPicker.vue` | Emoji selection interface |

## Layout Components
| Old Path | New Path | Description |
|----------|----------|-------------|
| `Header.vue` | `layout/AppHeader.vue` | Main application header |
| `Footer.vue` | `layout/AppFooter.vue` | Main application footer |
| `HeroSection.vue` | `layout/HeroSection.vue` | Hero banner section |
| `TransitionSection.vue` | `layout/TransitionSection.vue` | Transition sections |
| `CarouselSection.vue` | `layout/CarouselSection.vue` | Carousel/slider sections |

## Navigation Components
| Old Path | New Path | Description |
|----------|----------|-------------|
| `MobileMenu.vue` | `navigation/menus/MobileMenu.vue` | Mobile navigation menu |
| `EscMenu.vue` | `navigation/menus/EscMenu.vue` | Escape key menu |
| `navs/SLinkList.vue` | `navigation/LinkList.vue` | List of navigation links |
| `navs/ListH.vue` | `navigation/HorizontalNav.vue` | Horizontal navigation |
| `navs/ListV.vue` | `navigation/VerticalNav.vue` | Vertical navigation |
| `LanguageSelector.vue` | `navigation/LanguageSelector.vue` | Language selection menu |
| `MobileLangSelector.vue` | `navigation/MobileLanguageSelector.vue` | Mobile language selector |

## UI Components
### Cards
| Old Path | New Path | Description |
|----------|----------|-------------|
| `CosmicCard.vue` | `ui/cards/BaseCard.vue` | Base card component |
| `LoreStoryCard.vue` | `ui/cards/StoryCard.vue` | Story card component |
| `cards/TokenCard.vue` | `ui/cards/TokenCard.vue` | Token card component |
| `cards/NFTCard.vue` | `ui/cards/NFTCard.vue` | NFT card component |

### Buttons
| Old Path | New Path | Description |
|----------|----------|-------------|
| `CosmicButton.vue` | `ui/buttons/BaseButton.vue` | Base button component |
| `ResetCameraButton.vue` | `ui/buttons/ResetCameraButton.vue` | Camera reset button |

### Other UI Components
| Old Path | New Path | Description |
|----------|----------|-------------|
| `GameTooltip.vue` | `ui/tooltips/GameTooltip.vue` | Game tooltip component |
| `GenericTable.vue` | `ui/tables/Table.vue` | Generic table component |
| `TableMenuView.vue` | `ui/tables/TableMenuView.vue` | Table menu view |
| `TableMenu.vue` | `ui/tables/TableMenu.vue` | Table menu component |
| `collections/TokenGrid.vue` | `ui/collections/TokenGrid.vue` | Token grid component |
| `collections/NFTCollection.vue` | `ui/collections/NFTCollection.vue` | NFT collection component |

## User Components
| Old Path | New Path | Description |
|----------|----------|-------------|
| `Login.vue` | `user/LoginForm.vue` | User login form |
| `Registration.vue` | `user/RegistrationForm.vue` | User registration form |
| `AccountRecovery.vue` | `user/AccountRecovery.vue` | Account recovery component |
| `account/AccountSearch.vue` | `user/AccountSearch.vue` | Account search |
| `account/AvatarSelector.vue` | `user/AvatarSelector.vue` | Avatar selection |
| `account/AccountMenu.vue` | `user/AccountMenu.vue` | Account menu |
| `account/FriendQuery.vue` | `user/FriendsList.vue` | Friends management |
| `PlayerAvatar.vue` | `user/PlayerAvatar.vue` | Player avatar display |
| `NotificationIcon.vue` | `user/NotificationIcon.vue` | Notification icon and display |

## Game Components
### Map
| Old Path | New Path | Description |
|----------|----------|-------------|
| `GalaxyMap.vue` | `game/map/GalaxyMap.vue` | Galaxy map display |
| `MetaverseMap.vue` | `game/map/MetaverseMap.vue` | Metaverse map |
| `Map/Stars.vue` | `game/map/Stars.vue` | Stars rendering |
| `Map/Nebula.vue` | `game/map/Nebula.vue` | Nebula rendering |

### Tournament
| Old Path | New Path | Description |
|----------|----------|-------------|
| `tournament/Match.vue` | `game/tournament/Match.vue` | Tournament match |
| `tournament/TournamentSection.vue` | `game/tournament/TournamentSection.vue` | Tournament section |

### Interactive
| Old Path | New Path | Description |
|----------|----------|-------------|
| `DialogueBox.vue` | `game/interactive/DialogueBox.vue` | Dialogue box |
| `EntityPanel.vue` | `game/interactive/EntityPanel.vue` | Entity panel |
| `Entity.vue` | `game/interactive/Entity.vue` | Entity component |
| `Fps.vue` | `game/interactive/Fps.vue` | FPS counter |

## Wallet Components
| Old Path | New Path | Description |
|----------|----------|-------------|
| `actions/WalletActions.vue` | `wallet/actions/WalletActions.vue` | Wallet actions |
| `layout/WalletHeader.vue` | `wallet/crypto/WalletHeader.vue` | Wallet header |
| `IcpBalanceTest.vue` | `wallet/crypto/IcpBalanceTest.vue` | ICP balance testing |
| `nfts/FullMD.vue` | `wallet/nft/FullNftDetails.vue` | Full NFT metadata |
| `nfts/CompactMD.vue` | `wallet/nft/CompactNftDetails.vue` | Compact NFT metadata |

## Forms Components
| Old Path | New Path | Description |
|----------|----------|-------------|
| `forms/SendTokenForm.vue` | `forms/SendTokenForm.vue` | Send token form |
| `forms/AddTokenForm.vue` | `forms/AddTokenForm.vue` | Add token form |
| `forms/ReceiveTokenInfo.vue` | `forms/ReceiveTokenInfo.vue` | Receive token info |

## Feedback Components
| Old Path | New Path | Description |
|----------|----------|-------------|
| `feedback/LoadingIndicator.vue` | `feedback/LoadingIndicator.vue` | Loading indicator |
| `feedback/ActivityLog.vue` | `feedback/ActivityLog.vue` | Activity log |
| `Proposals.vue` | `feedback/Proposals.vue` | Proposals display |

## Media Components
| Old Path | New Path | Description |
|----------|----------|-------------|
| `Starfield.vue` | `media/Starfield.vue` | Starfield background |
| `LoadingScreen.vue` | `media/LoadingScreen.vue` | Loading screen |
| `CosmicBackground.vue` | `media/CosmicBackground.vue` | Cosmic background |
| `CosmicBackground_C.vue` | `media/CosmicBackgroundAlt.vue` | Alternative cosmic background |

## Other Components
Any components not specifically categorized above will be reviewed individually for best placement. 