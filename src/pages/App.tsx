import { DappKitResponseStatus } from '@celo/utils'
import { useContractKit } from '@celo-tools/use-contractkit'
import { ErrorBoundary } from '@sentry/react'
import React, { Suspense, useMemo } from 'react'
import { Route, Switch, useHistory, useLocation } from 'react-router-dom'
import { useDarkModeManager } from 'state/user/hooks'
import styled from 'styled-components'
import UbeswapHeader from 'ubeswap-header'
import { isBanned } from 'utils/isBannedUser'

import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
// import Header from '../components/Header'
import Polling from '../components/Header/Polling'
import URLWarning from '../components/Header/URLWarning'
import Popups from '../components/Popups'
import { V3Url } from '../constants'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import { getMobileOperatingSystem, Mobile } from '../utils/mobile'
import AddLiquidity from './AddLiquidity'
import {
  RedirectDuplicateTokenIds,
  RedirectOldAddLiquidityPathStructure,
  RedirectToAddLiquidity,
} from './AddLiquidity/redirects'
import Earn from './Earn'
import Manage from './Earn/Manage'
import ManageSingle from './Earn/ManageSingle'
import LimitOrder from './LimitOrder'
import Pool from './Pool'
import PoolFinder from './PoolFinder'
import RemoveLiquidity from './RemoveLiquidity'
import { RedirectOldRemoveLiquidityPathStructure } from './RemoveLiquidity/redirects'
import Send from './Send'
import { Stake } from './Stake'
import AddProposal from './Stake/AddProposal'
import Swap from './Swap'
import { OpenClaimAddressModalAndRedirectToSwap, RedirectPathToSwapOnly, RedirectToSwap } from './Swap/redirects'
import FarmBackground from 'assets/images/background-farm.jpg'
import LimitOrderBackground from 'assets/images/background-limit-order.jpg'
import PoolBackground from 'assets/images/background-pool.jpg'
import StakeBackground from 'assets/images/background-stake.jpg'

const AppWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  overflow-x: hidden;
  min-height: 100vh;
`

// const HeaderWrapper = styled.div`
//   ${({ theme }) => theme.flexRowNoWrap}
//   width: 100%;
//   justify-content: space-between;
// `

const UbeswapHeaderWrapper = styled.div`
  position: absolute;
  width: 100%;
`

const BodyWrapper = styled.div<{ backgroundImg: string }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 111px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 87px 16px;
  `};

  z-index: 1;
  background-image: ${(props) => `url(${props.backgroundImg})`};
  background-size: cover;
  background-repeat: no-repeat;
`

const Marginer = styled.div`
  margin-top: 5rem;
`

const localStorageKey = 'valoraRedirect'

export default function App() {
  const history = useHistory()
  const curLocation = useLocation()
  const { address } = useContractKit()
  const [darkMode, toggleDarkMode] = useDarkModeManager()

  const backgroundImg = useMemo(() => {
    switch (curLocation.pathname) {
      case '/farm':
        return FarmBackground
      case '/pool':
        return PoolBackground
      case '/limit-order':
        return LimitOrderBackground
      case '/stake':
        return StakeBackground
      default:
        return FarmBackground
    }
  }, [curLocation.pathname])

  React.useEffect(() => {
    // Close window if search params from Valora redirect are present (handles Valora connection issue)
    if (typeof window !== 'undefined') {
      const url = window.location.href
      const whereQuery = url.indexOf('?')
      if (whereQuery !== -1) {
        const query = url.slice(whereQuery)
        const params = new URLSearchParams(query)
        if (params.get('status') === DappKitResponseStatus.SUCCESS) {
          localStorage.setItem(localStorageKey, window.location.href)
          const mobileOS = getMobileOperatingSystem()
          if (mobileOS === Mobile.ANDROID) {
            window.close()
          }
        }
      }
    }
  }, [curLocation])

  const handleNavChange = (menu: string, version: number) => {
    if (version === 2) {
      const url = menu === 'logo' || menu === 'swap' ? '' : menu
      history.push(`/${url}`)
    } else {
      location.href = `${V3Url}/#/${menu}`
    }
  }

  const handleModeChange = () => {
    // permanent dark mode
    if (darkMode === false) {
      toggleDarkMode()
    }
  }

  if (isBanned(address)) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <AppWrapper>
        <UbeswapHeaderWrapper>
          <UbeswapHeader
            darkMode={true}
            showToggleDarkMode={false}
            enableUrlWarning={false}
            onNavChanged={(menu: string, version: number) => {
              handleNavChange(menu, version)
            }}
            onModeChanged={() => {
              handleModeChange()
            }}
          />
        </UbeswapHeaderWrapper>
        <URLWarning />
        {/* <HeaderWrapper>
          <Header />
        </HeaderWrapper> */}
        <BodyWrapper backgroundImg={backgroundImg}>
          <Popups />
          <Polling />
          <ErrorBoundary fallback={<p>An unexpected error occured on this part of the page. Please reload.</p>}>
            <Switch>
              <Route exact strict path="/swap" component={Swap} />
              <Route exact strict path="/limit-order" component={LimitOrder} />
              <Route exact strict path="/claim" component={OpenClaimAddressModalAndRedirectToSwap} />
              <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} />
              <Route exact strict path="/send" component={Send} />
              <Route exact strict path="/find" component={PoolFinder} />
              <Route exact strict path="/pool" component={Pool} />
              <Route exact strict path="/create" component={RedirectToAddLiquidity} />
              <Route exact path="/add" component={AddLiquidity} />
              <Route exact path="/add/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/add/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact path="/create" component={AddLiquidity} />
              <Route exact path="/create/:currencyIdA" component={RedirectOldAddLiquidityPathStructure} />
              <Route exact path="/create/:currencyIdA/:currencyIdB" component={RedirectDuplicateTokenIds} />
              <Route exact strict path="/remove/:tokens" component={RedirectOldRemoveLiquidityPathStructure} />
              <Route exact strict path="/remove/:currencyIdA/:currencyIdB" component={RemoveLiquidity} />
              <Route exact strict path="/farm" component={Earn} />
              <Route exact strict path="/farm/:currencyIdA/:currencyIdB/:stakingAddress" component={Manage} />
              <Route exact strict path="/farm/:currencyId/:stakingAddress" component={ManageSingle} />
              <Route exact strict path="/dualfarm/:currencyIdA/:currencyIdB/:stakingAddress" component={Manage} />
              <Route exact strict path="/stake" component={Stake} />
              <Route exact strict path="/add-proposal" component={AddProposal} />
              <Route component={RedirectPathToSwapOnly} />
            </Switch>
          </ErrorBoundary>
          <Marginer />
        </BodyWrapper>
      </AppWrapper>
    </Suspense>
  )
}
