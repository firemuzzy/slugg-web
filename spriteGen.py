#!/usr/bin/python

#you need spritemapper installed (pip install spritemapper)

# HOW does it work?
# 1. finds any css file in <app/assets/stylesheets/> that ends with sprite-pack.css
# 2. read it and creates a png sprite in <public/images/> and copies the augmented the *sprite-pack.css files to <public/stylesheets/sprites/>

# IMPORTANT:
# 1. you NEED app/assets/images directory to exist

import time
import datetime
import glob
import sys
import os
from subprocess import call, check_call, CalledProcessError, check_output
from shutil import move
import argparse
import tempfile

SPRITE_GEN_INI = "/tmp/spriteGen.ini"
TIMESTAMP = int(time.time())

def create_temp_ini(tmp_file, sprite_css, sprite_png):
  with open(tmp_file, 'w') as f:
    f.write("[spritemapper]\n")
    f.write("output_css = ../../../public/stylesheets/sprites/%s\n" % (sprite_css))
    f.write("output_image = ../images/%d-%s\n" % (TIMESTAMP, sprite_png))
    f.write("base_url = /assets/images/\n")
    #f.write("anneal_steps = 100000\n")

def main():
  parser = argparse.ArgumentParser(description='convert css files with images to css files with sprite')
  parser.add_argument('-f', '--force', default= False, action='store_true')
  args = parser.parse_args()


  dirname, filename = os.path.split(os.path.abspath(__file__))
  sprites = os.path.join(dirname, "app/assets/stylesheets/*sprite-pack.css")
  for sprite in glob.glob(sprites):
    css_filename = sprite.split('/')[-1]
    png_filename = css_filename.replace('.css', '.png')

    png_asset_path = os.path.join(dirname, 'app/assets/images/', str(TIMESTAMP)+"-"+png_filename)
    png_public_path = os.path.join(dirname, 'public/images/', str(TIMESTAMP)+"-"+png_filename)

    old_png_public_path = glob.glob(os.path.join(dirname, 'public/images/', "*-"+png_filename))
    if len(old_png_public_path) > 0:
      old_png_public_path = old_png_public_path[0]
    else:
      old_png_public_path = None

    #yes I'm arbitrarily setting the time diff to 10
    time_diff = 10
    sprite_time = datetime.datetime.strptime(time.ctime(os.path.getmtime(sprite)), "%a %b %d %H:%M:%S %Y")
    if tempfile._exists(old_png_public_path or png_public_path):
      png_time = datetime.datetime.strptime(time.ctime(os.path.getmtime(old_png_public_path or png_public_path)), "%a %b %d %H:%M:%S %Y")
      time_diff = (png_time - sprite_time).seconds

    create_temp_ini(SPRITE_GEN_INI, css_filename, png_filename)


    #if png sprite is more than 5 seconds older than css sprite, update it
    if time_diff > 5 or args.force:
      call(['spritemapper', sprite, "--conf", SPRITE_GEN_INI])

      #touch file to adjust its modified time
      call(['touch', sprite])

      move(png_asset_path, png_public_path)


      #add png files to git
      call(['git', 'add', png_public_path])



      #remove old assets
      for png_file in glob.glob(os.path.join(dirname, 'public/images/', "*-"+png_filename)):
        if png_file != png_public_path:
          call(['git', 'rm', '-f', png_file])

if __name__ == "__main__":
  main()
