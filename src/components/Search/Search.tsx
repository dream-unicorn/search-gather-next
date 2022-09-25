import { useEffect, useState } from 'react'
import { Input, Button } from 'antd'
import Icon from '@ant-design/icons'
import Image from 'next/image'
import { messList as msl, engineList as defaultEgl, UEngineItem, UMessItem } from './constant'
import { copy, openUrl } from '../utils'
import { showContextMenu } from '../ContextMenu'
import Icon_Map from './IconMap'

const context = require.context('./avatar', false)
const imageArray: string[] = context.keys().map((path: string) => context(path).default)

type ISearchType = 'mess' | 'engine'

function Search() {
  // const cacheSort: string = localStorage.cacheSort
  // const egl: UEngineItem[] = cacheSort
  //   ? JSON.parse(cacheSort).map((x: any) => defaultEgl.find(y => y.id === x))
  //   : defaultEgl

  const [messList, setMessList] = useState(msl)
  const [engineList, setEngineList] = useState(defaultEgl)
  const [avatarIdx, setAvatarIdx] = useState(/* Number(localStorage.avatarIdx) || */ 0)

  useEffect(() => {
    const onMouseup = () => {
      const selectedText = window.getSelection().toString()
      selectedText && window.navigator.clipboard.writeText(selectedText)
    }
    document.addEventListener('mouseup', onMouseup)

    return () => document.removeEventListener('mouseup', onMouseup)
  }, [])

  const messItemOnChange = (v: string, idx: number) => {
    messList[idx].value = v
    setMessList([...messList])
  }

  const engineItemOnChange = (v: string, idx: number) => {
    engineList[idx].value = v
    setEngineList([...engineList])
  }

  const messSearch = (value: string, idx: number, evt: any) => {
    const path: HTMLElement[] = evt.nativeEvent.path
    if (path.some(x => x.className === 'ant-input-suffix')) return // 清空输入框时不跳转
    const { link, home } = messList[idx]
    const url = value ? link + value : home
    if (!url) return
    url && openUrl(url)
  }

  const engineSearch = (value: string, idx: number) => {
    const { link } = engineList[idx]
    value && openUrl(link + value)
  }

  let sourceIdx = 0
  const onDragstart = (idx: number) => {
    sourceIdx = idx
  }

  const onDrop = (dropIdx: number) => {
    const nv = engineList.slice(0)
    const sourceItem = nv[sourceIdx]
    const dropItem = nv[dropIdx]
    nv.splice(dropIdx, 1, sourceItem)
    nv.splice(sourceIdx, 1, dropItem)
    setEngineList(nv)
    localStorage.cacheSort = JSON.stringify(nv.map(x => x.id))
  }

  const pasteToInput = async (type: ISearchType, idx: number) => {
    const value = await window.navigator.clipboard.readText()
    const nv = (type === 'engine' ? engineList : messList).slice()
    nv[idx].value = value
    type === 'engine' ? setEngineList(nv as UEngineItem[]) : setMessList(nv as UMessItem[])
  }

  const handleOnContextMenu = (evt: any, item: UEngineItem | UMessItem, idx: number, type: ISearchType) => {
    evt.preventDefault()
    showContextMenu(
      evt,
      [
        { key: 'copy', title: '复制' },
        { key: 'paste', title: '粘贴' },
        { key: 'paste-search', title: '粘贴并搜索' }
      ],
      async key => {
        if (key === 'copy') copy(item.value)
        else if (key === 'paste') pasteToInput(type, idx)
        else if (key === 'paste-search') pasteToInput(type, idx).then(() => openUrl(item.link + item.value))
      }
    )
  }

  const pasteSearch = (item: UEngineItem | UMessItem, idx: number, type: ISearchType) => {
    pasteToInput(type, idx).then(() => openUrl(item.link + item.value))
  }

  const togglePrev = () => {
    const nv = Math.max(0, avatarIdx - 1)
    setAvatarIdx(nv)
    localStorage.avatarIdx = nv
  }
  const toggleNext = () => {
    const nv = Math.min(imageArray.length - 1, avatarIdx + 1)
    setAvatarIdx(nv)
    localStorage.avatarIdx = nv
  }

  return (
    <div className="search-container">
      <section className="mess-container">
        {messList.map((item, idx) => (
          <div
            className="mess-item"
            key={idx}
            onContextMenu={evt => handleOnContextMenu(evt, item, idx, 'mess')}
          >
            <Input.Search
              value={item.value}
              tabIndex={engineList.length + idx + 1}
              spellCheck={false}
              onChange={evt => messItemOnChange(evt.target.value, idx)}
              onSearch={(value, evt) => messSearch(value, idx, evt)}
              placeholder={item.mark}
              enterButton={<Icon style={{ width: 20 }} component={() => Icon_Map.get(item.id) || null} />}
              allowClear
              size="large"
            />
            <Button className="paste-s" onClick={() => pasteSearch(item, idx, 'mess')}>
              s
            </Button>
          </div>
        ))}
        {/* <div className="mess-item">
          {concise.map(x => (
            <Button key={x.link} onClick={() => openUrl(x.link)}>
              <img src={x.logo} style={{ height: 30, verticalAlign: 'middle' }} />
            </Button>
          ))}
        </div> */}
      </section>

      <section className="engine-container">
        {engineList.map((item, idx) => (
          <div className="engine-item" key={idx}>
            <Image
              className="logo"
              src={item.logo}
              draggable
              onDragOver={evt => evt.preventDefault()}
              onDragStart={() => onDragstart(idx)}
              onDrop={() => onDrop(idx)}
            />
            <div
              className="input-search-wrapper"
              onContextMenu={evt => handleOnContextMenu(evt, item, idx, 'engine')}
            >
              <Input.Search
                autoFocus={idx === 0}
                tabIndex={idx + 1}
                spellCheck={false}
                value={item.value}
                onChange={evt => engineItemOnChange(evt.target.value, idx)}
                onSearch={value => engineSearch(value, idx)}
                placeholder={item.mark}
                enterButton={item.mark}
                allowClear
                size="large"
              />
              <Button className="paste-s" onClick={() => pasteSearch(item, idx, 'engine')}>
                s
              </Button>
            </div>
          </div>
        ))}

        <div className="cool-container">
          <Button.Group className="toggle-btn">
            <Button onClick={togglePrev}>上一个</Button>
            <Button onClick={toggleNext}>下一个</Button>
          </Button.Group>
          <div className="avatar-container">
            <Image className="avatar" src={imageArray[avatarIdx]} />
          </div>
        </div>
      </section>
    </div>
  )
}

export default Search
