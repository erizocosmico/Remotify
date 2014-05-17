-- Script from: http://www.leancrew.com/all-this/2011/07/spotify-info-on-the-desktop-via-nerdtool/

set SpotifyArtworkFolder to ((path to home folder) as text) & ¬
	"Remotify:SpotifyArtwork:" as alias
set ArtworkFromSpotify to ((path to home folder) as text) & ¬
	"Remotify:SpotifyArtwork:FromSpotify:albumArt.tiff" as alias
set SpotifyArtwork to ((path to home folder) as text) & ¬
	"Remotify:SpotifyArtwork:FromSpotify:albumArt.tiff"
set DefaultArtwork to ((path to home folder) as text) & ¬
	"Remotify:SpotifyArtwork:Default:albumArt.tiff"
set displayArtwork to ((path to home folder) as text) & ¬
	"Remotify:SpotifyArtwork:albumArt.tiff"
set FromSpotifyFolder to ((path to home folder) as text) & ¬
	"Remotify:SpotifyArtwork:FromSpotify:"
set ArtworkFromSpotify to FromSpotifyFolder & ¬
	"albumArt.tiff" as alias

-- Unix versions of the above path strings
set unixSpotifyArtwork to the quoted form of POSIX path of SpotifyArtwork
set unixDefaultArtwork to the quoted form of POSIX path of DefaultArtwork
set unixDisplayArtwork to the quoted form of POSIX path of displayArtwork

set whichArt to "blank"
tell application "System Events"
	if exists process "Spotify" then -- Spotify is running
		tell application "Spotify"
			set aTrackArtwork to artwork of current track
		end tell
		tell current application
			set fileRef to ¬
				(open for access ArtworkFromSpotify with write permission)
			write aTrackArtwork to fileRef
			close access fileRef
			
			(* Convert to Tiff *)
			tell application "Finder" to set creator type of ArtworkFromSpotify to "????"
			
			tell application "Image Events"
				set theImage to open ArtworkFromSpotify
				save theImage as TIFF in SpotifyArtworkFolder with replacing
			end tell
		end tell
		set whichArt to "Spotify"
	end if
end tell


if whichArt is "Spotify" then
	do shell script "ditto -rsrc " & unixSpotifyArtwork & space & unixDisplayArtwork
else
	do shell script "ditto -rsrc " & unixDefaultArtwork & space & unixDisplayArtwork
end if
