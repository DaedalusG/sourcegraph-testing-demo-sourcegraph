import UploadIcon from 'mdi-react/UploadIcon'
import React, { useCallback, useRef } from 'react'
import * as uuid from 'uuid'

import { ErrorLike } from '@sourcegraph/common'
import { TelemetryProps } from '@sourcegraph/shared/src/telemetry/telemetryService'
import { Button } from '@sourcegraph/wildcard'

import { AuthenticatedUser } from '../../../auth'
import { CreateNotebookVariables } from '../../../graphql-operations'
import { convertMarkdownToBlocks } from '../convertMarkdownToBlocks'
import { blockToGQLInput } from '../serialize'

const LOADING = 'loading' as const

const INVALID_IMPORT_FILE_ERROR = new Error(
    'Cannot read the imported file. Check that the imported file is a Markdown-formatted text file.'
)

const MAX_FILE_SIZE_IN_BYTES = 1000 * 1000 // 1MB

interface ImportMarkdownNotebookButtonProps extends TelemetryProps {
    authenticatedUser: AuthenticatedUser
    importNotebook: (notebook: CreateNotebookVariables['notebook']) => void
    importState: typeof LOADING | ErrorLike | undefined
    setImportState: (state: typeof LOADING | ErrorLike | undefined) => void
}

export const ImportMarkdownNotebookButton: React.FunctionComponent<ImportMarkdownNotebookButtonProps> = ({
    authenticatedUser,
    telemetryService,
    importState,
    setImportState,
    importNotebook,
}) => {
    const fileInputReference = useRef<HTMLInputElement>(null)

    const onImportButtonClick = useCallback(() => {
        telemetryService.log('SearchNotebookImportMarkdownNotebookButtonClick')
        fileInputReference.current?.click()
    }, [fileInputReference, telemetryService])

    const onFileInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files
            if (!files || files.length !== 1) {
                setImportState(INVALID_IMPORT_FILE_ERROR)
                return
            }

            if (files[0].size > MAX_FILE_SIZE_IN_BYTES) {
                setImportState(new Error('File too large. Maximum allowed file size is 1MB.'))
                return
            }

            setImportState(LOADING)

            const fileName = files[0].name
            const reader = new FileReader()
            reader.addEventListener('load', event => {
                if (!event.target || !event.target.result || typeof event.target.result !== 'string') {
                    setImportState(INVALID_IMPORT_FILE_ERROR)
                    return
                }
                const blocks = convertMarkdownToBlocks(event.target.result).map(block =>
                    blockToGQLInput({ id: uuid.v4(), ...block })
                )
                importNotebook({
                    title: fileName.split('.snb.md')[0],
                    blocks,
                    public: false,
                    namespace: authenticatedUser.id,
                })
            })
            reader.readAsText(files[0])
        },
        [authenticatedUser, importNotebook, setImportState]
    )

    return (
        <>
            <input type="file" className="d-none" ref={fileInputReference} accept=".md" onChange={onFileInputChange} />
            <Button variant="secondary" onClick={onImportButtonClick} disabled={importState === LOADING}>
                <UploadIcon className="icon-inline mr-1" />
                <span>{importState === LOADING ? 'Importing...' : 'Import Markdown notebook'}</span>
            </Button>
        </>
    )
}
