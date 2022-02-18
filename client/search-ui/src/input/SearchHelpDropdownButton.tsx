import classNames from 'classnames'
import ExternalLinkIcon from 'mdi-react/ExternalLinkIcon'
import HelpCircleOutlineIcon from 'mdi-react/HelpCircleOutlineIcon'
import React, { useCallback, useState } from 'react'
import { DropdownItem } from 'reactstrap'

import { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { PopoverTrigger, PopoverContent, Popover, Button, Alert, Position, Link } from '@sourcegraph/wildcard'

import styles from './SearchHelpDropdownButton.module.scss'

interface SearchHelpDropdownButtonProps extends TelemetryProps {
    isSourcegraphDotCom?: boolean
}

/**
 * A dropdown button that shows a menu with reference documentation for Sourcegraph search query
 * syntax.
 */
export const SearchHelpDropdownButton: React.FunctionComponent<SearchHelpDropdownButtonProps> = ({
    isSourcegraphDotCom,
    telemetryService,
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const toggleIsOpen = useCallback(() => setIsOpen(!isOpen), [isOpen])
    const onQueryDocumentationLinkClicked = useCallback(() => {
        telemetryService.log('SearchHelpDropdownQueryDocsLinkClicked')
        toggleIsOpen()
    }, [toggleIsOpen, telemetryService])
    const documentationUrlPrefix = isSourcegraphDotCom ? 'https://docs.sourcegraph.com' : '/help'

    return (
        <Popover isOpen={isOpen} onOpenChange={event => setIsOpen(event.isOpen)}>
            <PopoverTrigger
                as={Button}
                variant="link"
                className={classNames('px-2 d-flex align-items-center cursor-pointer', styles.triggerButton)}
                aria-label="Quick help for search"
            >
                <HelpCircleOutlineIcon
                    className="test-search-help-dropdown-button-icon icon-inline"
                    aria-hidden="true"
                />
            </PopoverTrigger>
            <PopoverContent position={Position.bottomEnd} className={classNames('pb-0', styles.content)}>
                <DropdownItem header={true}>
                    <strong>Search reference</strong>
                </DropdownItem>
                <DropdownItem divider={true} />
                <DropdownItem header={true}>Finding matches:</DropdownItem>
                <ul className="list-unstyled px-2 mb-2">
                    <li>
                        <span className="text-muted small">Structural:</span>{' '}
                        <code>
                            <strong>if(:[my_match]) </strong>
                        </code>
                    </li>
                    <li>
                        <span className="text-muted small">Regexp:</span>{' '}
                        <code>
                            <strong>(read|write)File</strong>
                        </code>
                    </li>
                    <li>
                        <span className="text-muted small">Exact:</span>{' '}
                        <code>
                            "<strong>fs.open(f)</strong>"
                        </code>
                    </li>
                </ul>
                <DropdownItem divider={true} />
                <DropdownItem header={true}>Common search keywords:</DropdownItem>
                <ul className="list-unstyled px-2 mb-2">
                    <li>
                        <code>
                            repo:<strong>my/repo</strong>
                        </code>
                    </li>
                    {isSourcegraphDotCom && (
                        <li>
                            <code>
                                repo:<strong>github.com/myorg/</strong>
                            </code>
                        </li>
                    )}
                    <li>
                        <code>
                            file:<strong>my/file</strong>
                        </code>
                    </li>
                    <li>
                        <code>
                            lang:<strong>javascript</strong>
                        </code>
                    </li>
                </ul>
                <DropdownItem divider={true} />
                <DropdownItem header={true}>Diff/commit search keywords:</DropdownItem>
                <ul className="list-unstyled px-2 mb-2">
                    <li>
                        <code>type:diff</code> <em className="text-muted small">or</em> <code>type:commit</code>
                    </li>
                    <li>
                        <code>
                            after:<strong>"2 weeks ago"</strong>
                        </code>
                    </li>
                    <li>
                        <code>
                            author:<strong>alice@example.com</strong>
                        </code>
                    </li>
                    <li className="text-nowrap">
                        <code>
                            repo:<strong>r@*refs/heads/</strong>
                        </code>{' '}
                        <span className="text-muted small">(all branches)</span>
                    </li>
                </ul>
                <DropdownItem divider={true} className="mb-0" />
                <Link
                    target="_blank"
                    rel="noopener"
                    to={`${documentationUrlPrefix}/code_search/reference/queries`}
                    className="dropdown-item"
                    onClick={onQueryDocumentationLinkClicked}
                >
                    <ExternalLinkIcon className="icon-inline small" /> All search keywords
                </Link>
                {isSourcegraphDotCom && (
                    <Alert className="small rounded-0 mb-0 mt-1" variant="info">
                        On Sourcegraph.com, use a <code>repo:</code> filter to narrow your search to &le;500
                        repositories.
                    </Alert>
                )}
            </PopoverContent>
        </Popover>
    )
}
