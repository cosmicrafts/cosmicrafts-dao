#!/bin/bash

# Component Migration Script
# This script will create the new component structure and move files accordingly

# Create top-level directories 
mkdir -p src/components/{core,ui,layout,navigation,user,game,wallet,forms,feedback,media}

# Create subdirectories
mkdir -p src/components/core/modals
mkdir -p src/components/ui/{cards,buttons,tooltips,tables,collections}
mkdir -p src/components/navigation/menus
mkdir -p src/components/game/{map,tournament,interactive}
mkdir -p src/components/wallet/{actions,crypto,nft}

# CORE COMPONENTS
echo "Migrating Core Components..."
cp src/components/Modal.vue src/components/core/modals/BaseModal.vue
cp src/components/Chat.vue src/components/core/Chat.vue
cp src/components/MarkdownRenderer.vue src/components/core/MarkdownRenderer.vue
cp src/components/EmojiPicker.vue src/components/core/EmojiPicker.vue

# LAYOUT COMPONENTS
echo "Migrating Layout Components..."
cp src/components/Header.vue src/components/layout/AppHeader.vue
cp src/components/Footer.vue src/components/layout/AppFooter.vue
cp src/components/HeroSection.vue src/components/layout/HeroSection.vue
cp src/components/TransitionSection.vue src/components/layout/TransitionSection.vue
cp src/components/CarouselSection.vue src/components/layout/CarouselSection.vue

# NAVIGATION COMPONENTS
echo "Migrating Navigation Components..."
cp src/components/MobileMenu.vue src/components/navigation/menus/MobileMenu.vue
cp src/components/EscMenu.vue src/components/navigation/menus/EscMenu.vue
cp src/components/navs/SLinkList.vue src/components/navigation/LinkList.vue
cp src/components/navs/ListH.vue src/components/navigation/HorizontalNav.vue
cp src/components/navs/ListV.vue src/components/navigation/VerticalNav.vue
cp src/components/LanguageSelector.vue src/components/navigation/LanguageSelector.vue
cp src/components/MobileLangSelector.vue src/components/navigation/MobileLanguageSelector.vue

# UI COMPONENTS
echo "Migrating UI Components..."
# Cards
cp src/components/CosmicCard.vue src/components/ui/cards/BaseCard.vue
cp src/components/LoreStoryCard.vue src/components/ui/cards/StoryCard.vue
cp src/components/cards/TokenCard.vue src/components/ui/cards/TokenCard.vue
cp src/components/cards/NFTCard.vue src/components/ui/cards/NFTCard.vue

# Buttons
cp src/components/CosmicButton.vue src/components/ui/buttons/BaseButton.vue
cp src/components/ResetCameraButton.vue src/components/ui/buttons/ResetCameraButton.vue

# Other UI
cp src/components/GameTooltip.vue src/components/ui/tooltips/GameTooltip.vue
cp src/components/GenericTable.vue src/components/ui/tables/Table.vue
cp src/components/TableMenuView.vue src/components/ui/tables/TableMenuView.vue
cp src/components/TableMenu.vue src/components/ui/tables/TableMenu.vue
cp src/components/collections/TokenGrid.vue src/components/ui/collections/TokenGrid.vue
cp src/components/collections/NFTCollection.vue src/components/ui/collections/NFTCollection.vue

# USER COMPONENTS
echo "Migrating User Components..."
cp src/components/Login.vue src/components/user/LoginForm.vue
cp src/components/Registration.vue src/components/user/RegistrationForm.vue
cp src/components/AccountRecovery.vue src/components/user/AccountRecovery.vue
cp src/components/account/AccountSearch.vue src/components/user/AccountSearch.vue
cp src/components/account/AvatarSelector.vue src/components/user/AvatarSelector.vue
cp src/components/account/AccountMenu.vue src/components/user/AccountMenu.vue
cp src/components/account/FriendQuery.vue src/components/user/FriendsList.vue
cp src/components/PlayerAvatar.vue src/components/user/PlayerAvatar.vue
cp src/components/NotificationIcon.vue src/components/user/NotificationIcon.vue

# GAME COMPONENTS
echo "Migrating Game Components..."
# Map
cp src/components/GalaxyMap.vue src/components/game/map/GalaxyMap.vue
cp src/components/MetaverseMap.vue src/components/game/map/MetaverseMap.vue
cp src/components/Map/Stars.vue src/components/game/map/Stars.vue
cp src/components/Map/Nebula.vue src/components/game/map/Nebula.vue

# Tournament
cp src/components/tournament/Match.vue src/components/game/tournament/Match.vue
cp src/components/tournament/TournamentSection.vue src/components/game/tournament/TournamentSection.vue

# Interactive
cp src/components/DialogueBox.vue src/components/game/interactive/DialogueBox.vue
cp src/components/EntityPanel.vue src/components/game/interactive/EntityPanel.vue
cp src/components/Entity.vue src/components/game/interactive/Entity.vue
cp src/components/Fps.vue src/components/game/interactive/Fps.vue

# WALLET COMPONENTS
echo "Migrating Wallet Components..."
cp src/components/actions/WalletActions.vue src/components/wallet/actions/WalletActions.vue
cp src/components/layout/WalletHeader.vue src/components/wallet/crypto/WalletHeader.vue
cp src/components/IcpBalanceTest.vue src/components/wallet/crypto/IcpBalanceTest.vue
cp src/components/nfts/FullMD.vue src/components/wallet/nft/FullNftDetails.vue
cp src/components/nfts/CompactMD.vue src/components/wallet/nft/CompactNftDetails.vue

# FORMS COMPONENTS
echo "Migrating Forms Components..."
cp src/components/forms/SendTokenForm.vue src/components/forms/SendTokenForm.vue
cp src/components/forms/AddTokenForm.vue src/components/forms/AddTokenForm.vue
cp src/components/forms/ReceiveTokenInfo.vue src/components/forms/ReceiveTokenInfo.vue

# FEEDBACK COMPONENTS
echo "Migrating Feedback Components..."
cp src/components/feedback/LoadingIndicator.vue src/components/feedback/LoadingIndicator.vue
cp src/components/feedback/ActivityLog.vue src/components/feedback/ActivityLog.vue
cp src/components/Proposals.vue src/components/feedback/Proposals.vue

# MEDIA COMPONENTS
echo "Migrating Media Components..."
cp src/components/Starfield.vue src/components/media/Starfield.vue
cp src/components/LoadingScreen.vue src/components/media/LoadingScreen.vue
cp src/components/CosmicBackground.vue src/components/media/CosmicBackground.vue
cp src/components/CosmicBackground_C.vue src/components/media/CosmicBackgroundAlt.vue

echo "Migration completed! Please check src/components/ for the new structure."
echo "Remember to update import paths in your files before replacing the original components folder." 