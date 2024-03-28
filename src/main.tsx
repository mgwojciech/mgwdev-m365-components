import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <FluentProvider theme={teamsLightTheme}>
      <App />
    </FluentProvider>,
)
