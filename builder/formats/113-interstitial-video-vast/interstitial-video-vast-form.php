<!-- Contact form -->
<style>
td {height:50px;}
table { width:90%;}
.site-content {background-image:url(img/blue-bg.jpg);width:100%;
		height:200px;padding-top:90px;font-size:20px }
.wordwrap { 
   white-space: pre-wrap;      /* CSS3 */   
   white-space: -moz-pre-wrap; /* Firefox */    
   white-space: -pre-wrap;     /* Opera <7 */   
   white-space: -o-pre-wrap;   /* Opera 7 */    
   word-wrap: break-word;      /* IE */
   width:600px;
}		
</style>
<main>
<div class="container">

<div class="row mt-5">
<div class='col-lg-12 col-md-12'>
    <p class="h5 left" style='margin-top:14px'>#113 - Video VAST Interstitial</p>
</div></div>

<div class="row">
<div class='col-lg-6 col-md-6'>
<form id=builderForm enctype="multipart/form-data" onsubmit="return false">
<br>

	<table>
		<input type="hidden" name="format" value='interstitial-video-vast'>

		<tr><td>Size:</td>
			<td><select type="text" id='size' name="size" class="form-control">
				<option value='800x600'>800x600</option>
				<option value='1280x720'>1280x720</option>
				<option value='fullscreen'>Fullscreen</option>
			    </select> 
			</td></tr>

<!--
		<tr><td>Collapsed Size:</td>
			<td><select type="text" name="collapsed_size" class="form-control">
				<option>970x90</option></select>
			</td></tr>

		<tr><td>Expanded Size:</td>
			<td><select type="text" name="expanded_size" class="form-control">
				<option>970x250</option></select>
			</td></tr>
-->		
		<tr><td>MP4 Video VAST</td>
			<td><textarea name='vast_url' style='height:300px;width:600px'></textarea><br>
				<div class='wordwrap'>Example:<br>https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=<br>&nbsp;</div></td></tr>
<!--
		<tr><td>Background image:</td>
			<td><input type="file" name='background_image'></td></tr>
-->
		<tr><td>Background color:</td>
			<td><input type="text" name='background_color'></td></tr>

<!--
		<tr><td>Expand button text or base64 image:</td>
			<td><input type="text" value='Abrir' name='expand_button'></td></tr>

		<tr><td>Collapse button text or base64 image:</td>
			<td><input type="text" value='Cerrar' name='collapse_button'></td></tr>
-->
<!--		<input name='clicktag_layer' type="hidden" value="1">-->

		<tr><td>Clicktag URL:</td>
			<td><input type="text" value='www.google.com' name='clicktag_url'></td></tr>

<!--		<tr><td>Background Color:</td>
			<td><input type="text" value='white'></td></tr>
-->

	</table>

    <div class="text-center">
        <button onclick='w.builder.submit()' class="btn btn-primary">Upload and generate Creative <i class="fa fa-paper-plane-o ml-1"></i></button>
         <div id='downloadButton'></div>
    </div>

</form>
</div>
</div><!-- mainPage -->


</div>
</main>