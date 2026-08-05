// Caché de letras completas para canciones que la API en vivo (api.lyrics.ovh)
// no logra encontrar de forma confiable. Se carga antes del script principal.
const LYRICS_CACHE={
  'queen|it\'s a beautiful day':`It's a beautiful day\nThe sun is shining, I feel good\nAnd no one's gonna\nStop me now, oh yeah\n\nIt's a beautiful day\nI feel good, I feel right\nAnd no one, no one's\nGonna stop me now, mama\n\nSometimes I feel so sad\nSo sad, so bad\nBut no one's gonna\nStop me now, no one\nOoh, it's hopeless\nSo hopeless to even try`,
  'michael jackson|girlfriend':`I'm gonna tell your boyfriend\nTell him\nExactly what we're doin'\nTell him what you do to me\nLate at night when the wind is free\nGirlfriend\nI'm gonna show your boyfriend\nShow him\nThe letters I've been savin'\nShow him how you feel inside\nAnd how love could not be denied\nWe're gonna have to tell him\nYou'll only be a girlfriend of mine\nGirlfriend\nYou better tell your boyfriend\nTell him\nExactly what we're doin'\nTell him what he needs to know\nOr he may never let you go`,
  'linkin park|what i\'ve done':`In this farewell\nThere's no blood, there's no alibi\n'Cause I've drawn regret\nFrom the truth of a thousand lies\nSo let mercy come and wash away\nWhat I've done\n\nI'll face myself to cross out what I've become\nErase myself\nAnd let go of what I've done\n\nPut to rest what you thought of me\nWhile I clean this slate\nWith the hands of uncertainty\nSo let mercy come and wash away\nWhat I've done\n\nI'll face myself to cross out what I've become\nErase myself\nAnd let go of what I've done\n\nFor what I've done\nI start again\nAnd whatever pain may come\nToday this ends\nI'm forgiving what I've done\n\nI'll face myself to cross out what I've become\nErase myself\nAnd let go of what I've done\nWhat I've done\nForgiving what I've done`,
  'jackson 5|who\'s lovin\' you':`When I (when I), had you (had you)\nI treated you bad and wrong my dear\nGirl since, since you went away\nDon't you know I sit around with my head hanging down?\nAnd I wonder who's lovin' you\n\nI, I, I, I\nShould have never, ever\nEver made you cry\nAnd girl since you been gone\nDon't you know I sit around with my head hanging down?\nAnd I wonder who's lovin' you\n\nLife without love, hu!\nIt's oh so lonely\nI don't think, I don't think I'm gonna make it\nAll my life (all my life), all my life (all my life)\nI've been lost to you only\nCome on and take it girl\nCome on and take it, because\n\nAll I can do since you've been gone is cry\nDon't you know I sit around with my head hanging down?\nAnd I wonder who's lovin' you\n\nI, I, I, I\nWho's lovin' you\nI, I, I, I\nI wonder (who's lovin' you)\nWho's lovin' you`,
  'michael jackson|she\'s out of my life':`She's Out Of My Life\nShe's Out Of My Life\nAnd I Don't Know Whether To Laugh Or Cry\nI Don't Know Whether To Live Or Die\nAnd It Cuts Like A Knife\nShe's Out Of My Life\n\nIt's Out Of My Hands\nIt's Out Of My Hands\nTo Think For Two Years She Was Here\nAnd I Took Her For Granted I Was So Cavalier\nNow The Way That It Stands\nShe's Out Of My Hands\n\nSo I've Learned That Love's Not Possession\nAnd I've Learned That Love Won't Wait\nNow I've Learned That Love Needs Expression\nBut I Learned Too Late\n\nShe's Out Of My Life\nShe's Out Of My Life\nDamned Indecision And Cursed Pride\nKept My Love For Her Locked Deep Inside\nAnd It Cuts Like A Knife\nShe's Out Of My Life`,
  'elvis presley|can\'t help falling in love':`Wise men say only fools rush in\nbut I can't help falling in love with you\nShall I stay\nwould it be a sin\nIf I can't help falling in love with you\n\nLike a river flows surely to the sea\nDarling so it goes\nsome things are meant to be\ntake my hand, take my whole life too\nfor I can't help falling in love with you\n\nLike a river flows surely to the sea\nDarling so it goes\nsome things are meant to be\ntake my hand, take my whole life too\nfor I can't help falling in love with you\nfor I can't help falling in love with you`,
  'john denver|annie\'s song':`You fill up my senses like a night in the forest,\nlike the mountains in springtime, like a walk in the rain,\nlike a storm in the desert, like a sleepy blue ocean.\nYou fill up my senses, come fill me again.\n\nCome let me love you, let me give my life to you,\nlet me drown in your laughter, let me die in your arms,\nlet me lay down beside you, let me always be with you.\nCome let me love you, come love me again.\n\nYou fill up my senses like a night in the forest,\nlike the mountains in springtime, like a walk in the rain,\nlike a storm in the desert, like a sleepy blue ocean.\nYou fill up my senses, come fill me again.`,
  'sam brown|stop':`All that I have is all that you've given me\nDid you never worry that I'd come to depend on you?\nI gave you all the love I had in me\nNow I find you lied and I can't believe it's true\n\nWrapped in her arms, I see you across the street\nAnd I can't help but wonder if she knows what's going on\nOh, you talk of love, but you don't know how it feels\nWhen you realise that you're not the only one\n\nOh, you'd better stop\nBefore you tear me all apart\nYou'd better stop\nBefore you go and break my heart\nOoh, you'd better stop\n\nTime after time, I've tried to walk away\nBut it's not that easy when your soul is torn in two\nSo I just resign myself to it every day\nNow all I can do is to leave it up to you\n\nOh, you'd better stop\nBefore you tear me all apart\nYou'd better stop\nBefore you go and break my heart\nOoh, you'd better stop`,
  'jay-z|empire state of mind':`Yeah, I'm out that Brooklyn, now I'm down in Tribeca\nRight next to De Niro, but I'll be hood forever\nI'm the new Sinatra, and since I made it here\nI can make it anywhere, yeah, they love me everywhere\nI used to cop in Harlem, hola, my Dominicanos\nRight there up on Broadway, brought me back to that McDonald's\nTook it to my stashbox, 560 State Street\nCatch me in the kitchen like a Simmons whippin' pastry\nCruisin' down 8th Street, off-white Lexus\nDriverin' so slow, but BK is from Texas\nMe, I'm out that Bed-Stuy, home of that boy Biggie\nNow I live on Billboard and I brought my boys with me\n\nIn New York\nConcrete jungle where dreams are made of\nThere's nothin' you can't do\nNow you're in New York\nThese streets will make you feel brand new\nBig lights will inspire you\nLet's hear it for New York\nNew York, New York\n\nWelcome to the melting pot, corners where we sellin' rock\nAfrika Bambataa shit, home of the hip-hop\nYellow cab, gypsy cab, dollar cab, holla back\nFor foreigners it ain't fair, they act like they forgot how to add\nEight million stories, out there in the naked city\nCity is a pity, half of y'all won't make it\nStatue of Liberty, long live the World Trade\nLong live the king, yo, I'm from the Empire State\n\nIn New York\nConcrete jungle where dreams are made of\nThere's nothin' you can't do\nNow you're in New York\nThese streets will make you feel brand new\nBig lights will inspire you\nLet's hear it for New York\nNew York, New York\n\nLights is blinding, girls need blinders\nCity of sin, it's a pity on a whim\nGood girls gone bad, the city's filled with them\nCame here for school, graduated to the high life\nBall players, rap stars, addicted to the limelight\nThe city never sleeps, better slip you an Ambien\n\nIn New York\nConcrete jungle where dreams are made of\nThere's nothin' you can't do\nNow you're in New York\nThese streets will make you feel brand new\nBig lights will inspire you\nLet's hear it for New York\nNew York, New York`,
  'the beatles|help!':`Help, I need somebody\nHelp, not just anybody\nHelp, you know I need someone, help\n\nWhen I was younger so much younger than today\nI never needed anybody's help in any way\nBut now these days are gone, I'm not so self assured\nNow I find I've changed my mind and opened up the doors\n\nHelp me if you can, I'm feeling down\nAnd I do appreciate you being round\nHelp me get my feet back on the ground\nWon't you please, please help me\n\nAnd now my life has changed in oh so many ways\nMy independence seems to vanish in the haze\nBut every now and then I feel so insecure\nI know that I just need you like I've never done before\n\nHelp me if you can, I'm feeling down\nAnd I do appreciate you being round\nHelp me get my feet back on the ground\nWon't you please, please help me\n\nWhen I was younger so much younger than today\nI never needed anybody's help in any way\nBut now these days are gone, I'm not so self assured\nNow I find I've changed my mind and opened up the doors\n\nHelp me if you can, I'm feeling down\nAnd I do appreciate you being round\nHelp me, get my feet back on the ground\nWon't you please, please help me, help me, help me, ooh`,
  'jackson 5|i\'ll be there':`You and I must make a pact, we must bring salvation back\nWhere there is love, I'll be there\nI'll reach out my hand to you, I'll have faith in all you do\nJust call my name and I'll be there\n\nAnd oh - I'll be there to comfort you,\nBuild my world of dreams around you, I'm so glad that I found you\nI'll be there with a love that's strong\nI'll be your strength, I'll keep holding on - yes I will, yes I will\n\nLet me fill your heart with joy and laughter\nTogetherness, well that's all I'm after\nWhenever you need me, I'll be there\nI'll be there to protect you, with an unselfish love I respect you\nJust call my name and I'll be there\n\nIf you should ever find someone new, I know he'd better be good to you\n'Cos if he doesn't, I'll be there\nDon't you know, baby, yeah yeah\n\nI'll be there, I'll be there, just call my name, I'll be there\nI'll be there, I'll be there, whenever you need me, I'll be there\nDon't you know, baby, yeah yeah`,
  'bon jovi|it\'s my life':`This ain't a song for the broken-hearted\nNo silent prayer for the faith-departed\nI ain't gonna be just a face in the crowd\nYou're gonna hear my voice\nWhen I shout it out loud\n\nIt's my life\nIt's now or never\nI ain't gonna live forever\nI just want to live while I'm alive\nMy heart is like an open highway\nLike Frankie said\nI did it my way\nI just wanna live while I'm alive\nIt's my life\n\nThis is for the ones who stood their ground\nFor Tommy and Gina who never backed down\nTomorrow's getting harder make no mistake\nLuck ain't even lucky\nGot to make your own breaks\n\nBetter stand tall when they're calling you out\nDon't bend, don't break, baby, don't back down`,
  'frank sinatra|that\'s life':`That's life, that's what all the people say\nYou're ridin' high in April, shot down in May\nBut I know I'm gonna change that tune\nWhen I'm back on top, back on top in June\n\nI said that's life, and as funny as it may seem\nSome people get their kicks stompin' on a dream\nBut I don't let it, let it get me down\n'cause this fine old world, it keeps spinnin' around\n\nI've been a puppet, a pauper, a pirate, a poet, a pawn and a king\nI've been up and down and over and out and I know one thing\nEach time I find myself flat on my face\nI pick myself up and get back in the race\n\nThat's life, I tell you I can't deny it\nI thought of quitting, baby, but my heart just ain't gonna buy it\nAnd if I didn't think it was worth one single try\nI'd jump right on a big bird and then I'd fly\n\nThat's life, that's life and I can't deny it\nMany times I thought of cuttin' out but my heart won't buy it\nBut if there's nothin' shakin' come this here July\nI'm gonna roll myself up in a big ball and die`,
  'tom jones|it\'s not unusual':`It's not unusual to be loved by anyone\nIt's not unusual to have fun with anyone\nbut when I see you hanging about with anyone\nIt's not unusual to see me cry,\noh I wanna die\n\nIt's not unusual to go out at any time\nbut when I see you out and about it's such a crime\nif you should ever want to be loved by anyone,\nIt's not unusual it happens every day no matter what you say\nyou find it happens all the time\nlove will never do what you want it to\nwhy can't this crazy love be mine\n\nIt's not unusual, to be mad with anyone\nIt's not unusual, to be sad with anyone\nbut if I ever find that you've changed at anytime\nit's not unusual to find out that I'm in love with you\nwhoa-oh-oh-oh-oh`,
  'frank sinatra|new york, new york':`Start spreadin' the news, I'm leavin' today\nI want to be a part of it\nNew York, New York\n\nThese vagabond shoes, are longing to stray\nRight through the very heart of it\nNew York, New York\n\nI want to wake up, in a city that never sleeps\nAnd find I'm king of the hill\nTop of the heap\n\nThese little town blues, are melting away\nI'll make a brand new start of it\nIn old New York\n\nIf I can make it there, I'll make it anywhere\nIt's up to you, New York, New York\n\nI want to wake up, in a city that never sleeps\nAnd find I'm A number one, top of the list\nKing of the hill, A number one\n\nThese little town blues, are melting away\nI'll make a brand new start of it\nIn old New York\n\nIf I can make it there, I'll make it anywhere\nIt's up to you, New York, New York`,
  'whitney houston|i\'m every woman':`Whatever you want\nWhatever you need\nAnything you want done baby\nI do it naturally\n\nI'm every woman\nIt's all in me\nAnything you want done baby\nI do it naturally\n\nI can read your thoughts right now\nEvery woman, whoever made ya say\nWhoa whoa whoa\n\nI can cast a spell\nSee, but you can't tell\nMix a special groove\nPut fire inside of you\nAnytime you feel danger or fear\nThen instantly I will appear\n\nI'm every woman\nIt's all in me\nAnything you want done baby\nI do it naturally\n\nI can set your knees like playing unto the seas\nI can make a rhyme of confusion in your mind\nAnd when it comes down to some little flash of love\nI got it, I got it, I got it, got it, baby\n\nI'm every woman\nIt's all in me\nAnything you want done baby\nI do it naturally\n\nI ain't braggin'\n'Cause I'm the one\nJust ask me\nOh, it shall be done\nAnd don't bother to compare\nI've got it`,
  'shakira|whenever, wherever':`Lucky you were born that far away so\nWe could both make fun of distance\nLucky that I love a foreign land for\nThe lucky fact of your existence\nBaby, I would climb the Andes solely\nTo count the freckles on your body\nNever could imagine there were only\nTen million ways to love somebody\n\nWhenever, wherever\nWe're meant to be together\nI'll be there and you'll be near\nAnd that's the deal, my dear\nThereover, hereunder\nYou'll never have to wonder\nWe can always play by ear\nBut that's the deal, my dear\n\nLucky that my lips not only mumble\nThey spill kisses like a fountain\nLucky that my breasts are small and humble\nSo you don't confuse them with mountains\nLucky I have strong legs like my mother\nTo run for cover when I need it\nAnd these two eyes that for no other\nThe day you leave will cry a river\n\nWhenever, wherever\nWe're meant to be together\nI'll be there and you'll be near\nAnd that's the deal, my dear\nThereover, hereunder\nYou've got me head over heels\nThere's nothing left to fear\nIf you really feel the way I feel`,
  'shakira|don\'t bother':`She's got the kind of look that defies gravity\nShe's the greatest cook\nAnd she's fat free\nShe's been to private school\nAnd she speaks perfect French\nShe's got her perfect friends\nOh, isn't she cool?\nShe practices Tai Chi\nShe'd never lose her nerve\nShe's more than you deserve\nShe's just far better than me\n\nSo don't bother\nI won't die of deception\nI promise you won't ever see me cry\nDon't feel sorry\nAnd don't bother, I'll be fine\nBut she's waiting\nThe ring you gave to her will lose its shine\nSo don't bother, be unkind\n\nI'm sure she doesn't know\nHow to touch you like I would\nI beat her at that one good\nDon't you think so?\nShe's almost six feet tall\nShe must think I'm a flea\nI'm really a cat, you see\nAnd it's not my last life at all\n\nSo don't bother\nI won't die of deception\nI promise you won't ever see me cry\nDon't feel sorry\nDon't bother, I'll be fine\nBut she's waiting\nThe ring you gave to her will lose its shine\nSo don't bother, be unkind\n\nFor you, I'd give up all I own\nAnd move to a communist country\nIf you came with me, of course\nAnd I'd file my nails so they don't hurt you\nAnd lose those pounds, learn about football\nIf it made you stay, but you won't, but you won't\n\nSo don't bother\nI'll be fine, I'll be fine\nPromise you won't ever see me cry\nAnd after all, I'm glad that I'm not your type`,
  'simply red|if you don\'t know me by now':`If you don't know me by now\nYou will never never never know me\n\nAll the things that we've been through\nYou should understand me\nLike I understand you\nNow girl I know the difference\nBetween right and wrong\nI ain't gonna do nothing\nTo break up our happy home\n\nDon't get so excited\nWhen I come home a little late at night\nCos we only act like children\nWhen we argue fuss and fight\n\nIf you don't know me by now\nYou will never never never know me\n\nWe've all got our own funny moods\nI've got mine, woman you've got yours too\nJust trust in me like I trust in you\nAs long as we've been together\nIt should be so easy to do\n\nJust get yourself together\nOr we might as well say goodbye\nWhat good is a love affair\nWhen you can't see eye to eye\n\nIf you don't know me by now\nYou will never\nNever never know me`,
  'earth, wind & fire|september':`Do you remember the 21st night of September?
Love was changing the minds of pretenders
While chasing the clouds away
Our hearts were ringing
In the key that our souls were singing
As we danced in the night
Remember, how the stars stole the night away

Ah, ah, ah
Ba-dee-ya, say, do you remember?
Ba-dee-ya, dancin' in September
Ba-dee-ya, never was a cloudy day
Ba-du-da, ba-du-da, ba-du-da, ba-du
Ba-du-da, ba-du, ba-du-da, ba-du
Ba-du-da, ba-du, ba-du-da

My thoughts are with you
Holding hands with your heart to see you
Only blue talk and love
Remember, how we knew love was here to stay
Now December found the love
That we shared in September
Only blue talk and love
Remember, the true love we share today
Hey, hey, hey

Ba-dee-ya, say, do you remember?
Ba-dee-ya, dancin' in September
Ba-dee-ya, never was a cloudy day
There was a
Ba-dee-ya, say, do you remember?
Ba-dee-ya, dancin' in September
Ba-dee-ya, golden dreams were shiny days
The bell was ringing
Our souls were singing
Do you remember?
Never was a cloudy day, yeaw
There was a
Ba-dee-ya, say, do you remember?
Ba-dee-ya, dancin' in September
Ba-dee-ya, never was a cloudy day
There was a
Ba-dee-ya, say, do you remember?
Ba-dee-ya, dancin' in September
Ba-dee-ya, golden dreams were shiny days
Ba-dee-ya, dee-ya, dee-ya
Ba-dee-ya, dee-ya, dee-ya
Ba-dee-ya, dee-ya, dee-ya, dee-ya
Ba-dee-ya, dee-ya, dee-ya
Ba-dee-ya, dee-ya, dee-ya
Ba-dee-ya, dee-ya`,
  'the proclaimers|i\'m gonna be (500 miles)':`When I wake up
Well, I know I'm gonna be
I'm gonna be the man who wakes up next to you
When I go out
Yeah, I know I'm gonna be
I'm gonna be the man who goes along with you
If I get drunk
Well, I know I'm gonna be
I'm gonna be the man who gets drunk next to you
And if I haver
Yeah, I know I'm gonna be
I'm gonna be the man who's haverin' to you
But I would walk five hundred miles
And I would walk five hundred more
Just to be the man who walked a thousand miles
To fall down at your door
When I'm workin'
Yes, I know I'm gonna be
I'm gonna be the man who's workin' hard for you
And when the money
Comes in for the work I do
I'll pass almost every penny on to you
When I come home (when I come home)
Oh, I know I'm gonna be
I'm gonna be the man who comes back home to you
And if I grow old
Well, I know I'm gonna be
I'm gonna be the man who's growin' old with you
But I would walk five hundred miles
And I would walk five hundred more
Just to be the man who walked a thousand miles
To fall down at your door
Da-da-da-da (da-da-da-da)
Da-da-da-da (da-da-da-da)
Da-da-dum-diddy-dum-diddy-dum-diddy-da-da-da
Da-da-da-da (da-da-da-da)
Da-da-da-da (da-da-da-da)
Da-da-dum-diddy-dum-diddy-dum-diddy-da-da-da
When I'm lonely
Well, I know I'm gonna be
I'm gonna be the man who's lonely without you
And when I'm dreamin'
Well, I know I'm gonna dream
I'm gonna dream about the time when I'm with you
When I go out (when I go out)
Well, I know I'm gonna be
I'm gonna be the man who goes along with you
And when I come home (when I come home)
Yes, I know I'm gonna be
I'm gonna be the man who comes back home with you
I'm gonna be the man who's comin' home with you
But I would walk five hundred miles
And I would walk five hundred more
Just to be the man who walked a thousand miles
To fall down at your door
Da-da-da-da (da-da-da-da)
Da-da-da-da (da-da-da-da)
Da-da-dum-diddy-dum-diddy-dum-diddy-da-da-da
Da-da-da-da (da-da-da-da)
Da-da-da-da (da-da-da-da)
Da-da-dum-diddy-dum-diddy-dum-diddy-da-da-da
Da-da-da-da (da-da-da-da)
Da-da-da-da (da-da-da-da)
Da-da-dum-diddy-dum-diddy-dum-diddy-da-da-da
Da-da-da-da (da-da-da-da)
Da-da-da-da (da-da-da-da)
Da-da-dum-diddy-dum-diddy-dum-diddy-da-da-da
And I would walk five hundred miles
And I would walk five hundred more
Just to be the man who walked a thousand miles
To fall down at your door`,
  'lady gaga|shallow':`Tell me something, girl
Are you happy in this modern world?
Or do you need more?
Is there something else you're searching for?

I'm falling
In all the good times
I find myself longing for change
And in the bad times, I fear myself

Tell me something, boy
Aren't you tired trying to fill that void?
Or do you need more?
Ain't it hard keeping it so hardcore?

I'm falling
In all the good times
I find myself longing for change
And in the bad times, I fear myself

I'm off the deep end, watch as I dive in
I'll never meet the ground
Crash through the surface
Where they can't hurt us
We're far from the shallow now

In the shallow, shallow
In the shallow, shallow
In the shallow, shallow
We're far from the shallow now

I'm off the deep end, watch as I dive in
I'll never meet the ground
Crash through the surface
Where they can't hurt us
We're far from the shallow now

In the shallow, shallow
In the shallow, shallow
In the shallow, shallow
We're far from the shallow now`,
  'a-ha|take on me':`We're talking away
I don't know what I'm to say
I'll say it anyway
Today's another day to find you
Shying away
I'll be coming for your love, okay?

Take on me (take on me)
Take me on (take on me)
I'll be gone
In a day or two

So needless to say
I'm odds and ends
But I'll be stumbling away
Slowly learning that life is okay
Say after me
It's no better to be safe than sorry

Take on me (take on me)
Take me on (take on me)
I'll be gone
In a day or two

All things that you say
Is it life or just to play my worries away?
You're all the things I've got to remember
You're shying away
I'll be coming for you anyway

Take on me (take on me)
Take me on (take on me)
I'll be gone
In a day

Take on me (take on me)
Take me on (take on me)
I'll be gone (take on me)
In a day`,

};
