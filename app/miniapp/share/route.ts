import { redirect } from 'next/navigation'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const emojis = searchParams.get('emojis')
  
  const shareText = emojis
    ? encodeURIComponent(`Just squared my politics with Squares! ${emojis}\n\nTry it:`)
    : encodeURIComponent(`Just squared my politics with Squares!\n\nTry it:`)
  
  const embedUrl = encodeURIComponent('https://farcaster.squares.vote/miniapp')
  
  return redirect(
    `https://farcaster.xyz/~/compose?text=${shareText}&embeds[]=${embedUrl}`
  )
}
