import classNames from 'classnames'
import React from 'react'
import { DropdownToggle, DropdownToggleProps } from 'reactstrap'

import { ButtonLink, ButtonLinkProps, Button, ButtonProps, ForwardReferenceComponent } from '@sourcegraph/wildcard'

import styles from './RepoHeaderActions.module.scss'

type RepoHeaderButtonLinkProps = ButtonLinkProps & {
    /**
     * to determine if this button is for file or not
     */
    file?: boolean
}

export const RepoHeaderActionButtonLink: React.FunctionComponent<RepoHeaderButtonLinkProps> = ({
    children,
    className,
    file,
    ...rest
}) => (
    <ButtonLink className={classNames(file ? styles.fileAction : styles.action, className)} {...rest}>
        {children}
    </ButtonLink>
)

export const RepoHeaderActionDropdownToggle: React.FunctionComponent<ButtonProps & DropdownToggleProps> = ({
    children,
    className,
    ...rest
}) => (
    <Button as={DropdownToggle} className={classNames('btn-icon', styles.action, className)} {...rest}>
        {children}
    </Button>
)

export type RepoHeaderActionAnchorProps = Omit<ButtonLinkProps, 'as' | 'href'> & {
    /**
     * to determine if this anchor is for file or not
     */
    file?: boolean
}

export const RepoHeaderActionAnchor = React.forwardRef((props: RepoHeaderActionAnchorProps, reference) => {
    const { children, className, file, ...rest } = props

    return (
        <ButtonLink
            className={classNames(file ? styles.fileAction : styles.action, className)}
            ref={reference}
            {...rest}
        >
            {children}
        </ButtonLink>
    )
}) as ForwardReferenceComponent<typeof ButtonLink, RepoHeaderActionAnchorProps>
