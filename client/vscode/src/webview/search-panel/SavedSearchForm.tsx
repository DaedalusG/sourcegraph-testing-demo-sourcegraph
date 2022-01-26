import classNames from 'classnames'
import React, { useMemo, useState } from 'react'
import { Omit } from 'utility-types'

import { ErrorAlert } from '@sourcegraph/branded/src/components/alerts'
import { Badge } from '@sourcegraph/branded/src/components/Badge'
import { Form } from '@sourcegraph/branded/src/components/Form'
import { AuthenticatedUser } from '@sourcegraph/shared/src/auth'
import { Link } from '@sourcegraph/shared/src/components/Link'
import { Scalars } from '@sourcegraph/shared/src/graphql-operations'
import { Container, PageHeader } from '@sourcegraph/wildcard'

import styles from './SearchResults.module.scss'

export interface SavedQueryFields {
    id: Scalars['ID']
    description: string
    query: string
    notify: boolean
    notifySlack: boolean
    slackWebhookURL: string | null
}

export interface SavedSearchFormProps {
    authenticatedUser: AuthenticatedUser | null
    defaultValues?: Partial<SavedQueryFields>
    title?: string
    submitLabel: string
    onSubmit: (fields: Omit<SavedQueryFields, 'id'>) => void
    loading: boolean
    error?: any
}

export const SavedSearchForm: React.FunctionComponent<SavedSearchFormProps> = props => {
    const [values, setValues] = useState<Omit<SavedQueryFields, 'id'>>(() => ({
        description: props.defaultValues?.description || '',
        query: props.defaultValues?.query || '',
        notify: props.defaultValues?.notify || false,
        notifySlack: props.defaultValues?.notifySlack || false,
        slackWebhookURL: props.defaultValues?.slackWebhookURL || '',
    }))

    /**
     * Returns an input change handler that updates the SavedQueryFields in the component's state
     *
     * @param key The key of saved query fields that a change of this input should update
     */
    const createInputChangeHandler = (
        key: keyof SavedQueryFields
    ): React.FormEventHandler<HTMLInputElement> => event => {
        const { value, checked, type } = event.currentTarget
        setValues(values => ({
            ...values,
            [key]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault()
        props.onSubmit(values)
    }

    /**
     * Tells if the query is unsupported for sending notifications.
     */
    const isUnsupportedNotifyQuery = useMemo((): boolean => {
        const notifying = values.notify || values.notifySlack
        return notifying && !values.query.includes('type:diff') && !values.query.includes('type:commit')
    }, [values])

    const codeMonitoringUrl = useMemo(() => {
        const searchParameters = new URLSearchParams()
        searchParameters.set('trigger-query', values.query)
        searchParameters.set('description', values.description)
        return `/code-monitoring/new?${searchParameters.toString()}`
    }, [values.query, values.description])

    const { query, description, notify, notifySlack, slackWebhookURL } = values

    return (
        <div className="saved-search-form">
            <PageHeader
                path={[{ text: props.title }]}
                headingElement="h2"
                description="Get notifications when there are new results for specific search queries."
                className="mb-3"
            />
            <Form onSubmit={handleSubmit}>
                <Container className="mb-3">
                    <div className="form-group">
                        <label className={styles.label} htmlFor="saved-search-form-input-description">
                            Description
                        </label>
                        <input
                            id="saved-search-form-input-description"
                            type="text"
                            name="description"
                            className="form-control test-saved-search-form-input-description"
                            placeholder="Description"
                            required={true}
                            value={description}
                            onChange={createInputChangeHandler('description')}
                        />
                    </div>
                    <div className="form-group">
                        <label className={styles.label} htmlFor="saved-search-form-input-query">
                            Query
                        </label>
                        <input
                            id="saved-search-form-input-query"
                            type="text"
                            name="query"
                            className="form-control test-saved-search-form-input-query"
                            placeholder="Query"
                            required={true}
                            value={query}
                            onChange={createInputChangeHandler('query')}
                        />
                    </div>

                    {props.defaultValues?.notify && (
                        <div className="form-group mb-0">
                            {/* Label is for visual benefit, input has more specific label attached */}
                            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                            <label className={styles.label} id="saved-search-form-email-notifications">
                                Email notifications
                            </label>
                            <div aria-labelledby="saved-search-form-email-notifications">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="Notify owner"
                                        className={styles.checkbox}
                                        defaultChecked={notify}
                                        onChange={createInputChangeHandler('notify')}
                                    />{' '}
                                    <span>Send email notifications to my email</span>
                                </label>
                            </div>

                            <div className={classNames(styles.codeMonitoringAlert, 'alert alert-primary p-3 mb-0')}>
                                <div className="mb-2">
                                    <strong>New:</strong> Watch your code for changes with code monitoring to get
                                    notifications.
                                </div>
                                <Link to={codeMonitoringUrl} className="btn btn-primary">
                                    Go to code monitoring →
                                </Link>
                            </div>
                        </div>
                    )}

                    {notifySlack && slackWebhookURL && (
                        <div className="form-group mt-3 mb-0">
                            <label className={styles.label} htmlFor="saved-search-form-input-slack">
                                Slack notifications
                            </label>
                            <input
                                id="saved-search-form-input-slack"
                                type="text"
                                name="Slack webhook URL"
                                className="form-control"
                                value={slackWebhookURL}
                                disabled={true}
                                onChange={createInputChangeHandler('slackWebhookURL')}
                            />
                            <small>
                                Slack webhooks are deprecated and will be removed in a future Sourcegraph version.
                            </small>
                        </div>
                    )}
                    {isUnsupportedNotifyQuery && (
                        <div className="alert alert-warning mt-3 mb-0">
                            <strong>Warning:</strong> non-commit searches do not currently support notifications.
                            Consider adding <code>type:diff</code> or <code>type:commit</code> to your query.
                        </div>
                    )}
                    {notify && !isUnsupportedNotifyQuery && (
                        <div className="alert alert-warning mt-3 mb-0">
                            <strong>Warning:</strong> Sending emails is not currently configured on this Sourcegraph
                            server. {props.authenticatedUser && 'Contact your server admin to enable sending emails.'}
                        </div>
                    )}
                </Container>
                <button
                    type="submit"
                    disabled={props.loading}
                    className={classNames(styles.submitButton, 'btn btn-primary test-saved-search-form-submit-button')}
                >
                    {props.submitLabel}
                </button>

                {props.error && !props.loading && <ErrorAlert className="mb-3" error={props.error} />}

                {!props.defaultValues?.notify && (
                    <Container className="d-flex p-3 align-items-start">
                        <Badge status="new" className="mr-3">
                            New
                        </Badge>
                        <span>
                            Watch for changes to your code and trigger email notifications, webhooks, and more with{' '}
                            <Link to="/code-monitoring">code monitoring →</Link>
                        </span>
                    </Container>
                )}
            </Form>
        </div>
    )
}