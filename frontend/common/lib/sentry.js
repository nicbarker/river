import * as Sentry from '@sentry/browser'

if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: 'https://' + process.env.SENTRY_KEY + '@sentry.io/1270659',
        integrations: integrations => {
            return integrations.filter(integration => integration.name !== 'GlobalHandlers')
        },
    })
}

export const logError = error => Sentry.captureException(error)