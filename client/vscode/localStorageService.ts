// VS Code Docs https://code.visualstudio.com/api/references/vscode-api#Memento
// A memento represents a storage utility. It can store and retrieve values.
import { Memento } from 'vscode'

import { LocalRecentSeachProps, LocalSearchHistoryProps } from './src/webview/contract'

// Currently storing:
// 15 Recent Search History: sg-searches
// 15 Recent Open Files: sg-files
// Last selected context: sg-selected-context
export class LocalStorageService {
    constructor(private storage: Memento) {}

    public getValue(key: string): string {
        return this.storage.get<string>(key, '')
    }

    public async setValue(key: string, value: string): Promise<boolean> {
        try {
            await this.storage.update(key, value)
            return true
        } catch {
            return false
        }
    }

    public async resetSgHistory(): Promise<boolean> {
        try {
            await this.storage.update('sg-search-history-test', [])
            await this.storage.update('sg-files-history-test', [])
            await this.storage.update('sg-last-selected-context', '')
            return true
        } catch {
            return false
        }
    }

    public getLocalRecentSearch(): LocalRecentSeachProps[] {
        const searchHistory = this.storage.get<LocalRecentSeachProps[]>('sg-search-history-test', [])
        return searchHistory
    }

    public async setLocalRecentSearch(newSearches: LocalRecentSeachProps[]): Promise<boolean> {
        try {
            await this.storage.update('sg-search-history-test', newSearches)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public getFileHistory(): string[] {
        return this.storage.get<string[]>('sg-files-history-test', [])
    }

    public async setFileHistory(newFile: string[]): Promise<boolean> {
        try {
            await this.storage.update('sg-files-history-test', newFile)
            return true
        } catch {
            return false
        }
    }

    public getUserLocalSearchHistory(): LocalSearchHistoryProps {
        return {
            searches: this.storage.get<LocalRecentSeachProps[]>('sg-search-history-test', []),
            files: this.storage.get<string[]>('sg-files-history-test', []),
        }
    }
}